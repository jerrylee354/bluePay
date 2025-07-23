

"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { ChevronLeft, AlertCircle, TicketCheck, TicketX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dictionary } from '@/dictionaries';
import { useAuth } from '@/context/auth-context';
import { LoadingOverlay } from './ui/loading-overlay';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAddTicketDialogStore } from '@/stores/add-ticket-dialog-store';

interface ScanTicketPageClientProps {
    dictionary: Dictionary;
    mode: 'add' | 'redeem';
}

interface ScannedTicketData {
    type: 'ticket_url' | 'ticket_redemption';
    url?: string;
    templateId?: string;
    issuerId?: string;
    ticketId?: string;
    userId?: string;
}

export default function ScanTicketPageClient({ dictionary, mode }: ScanTicketPageClientProps) {
    const d_wallet = dictionary.wallet;
    const d_tickets = dictionary.tickets;
    const router = useRouter();
    const { toast } = useToast();
    const { useTicket } = useAuth();
    const openAddTicketDialog = useAddTicketDialogStore((state) => state.openDialog);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dialogData, setDialogData] = useState<ScannedTicketData | null>(null);
    const [redeemError, setRedeemError] = useState<string | null>(null);


    useEffect(() => {
        const getCameraPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
            }
        };

        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleScan = useCallback(() => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            if (canvasRef.current) {
                const canvas = canvasRef.current;
                const video = videoRef.current;
                const ctx = canvas.getContext('2d');

                if (ctx) {
                    canvas.height = video.videoHeight;
                    canvas.width = video.videoWidth;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "dontInvert",
                    });

                    if (code && code.data && !scanResult) {
                        setScanResult(code.data);
                        setIsProcessing(true); // Stop scanning
                    }
                }
            }
        }
    }, [scanResult]);
    
    useEffect(() => {
        if (!hasCameraPermission || isProcessing) return;
        const intervalId = setInterval(handleScan, 200);
        return () => clearInterval(intervalId);
    }, [hasCameraPermission, isProcessing, handleScan]);


    const resetScanner = useCallback(() => {
        setScanResult(null);
        setDialogData(null);
        setRedeemError(null);
        setIsProcessing(false);
    }, []);

    useEffect(() => {
        if (isProcessing && scanResult) {
          try {
            const parsedData: ScannedTicketData = JSON.parse(scanResult);

            if (mode === 'add' && parsedData.type === 'ticket_url' && parsedData.url) {
                const url = new URL(parsedData.url);
                const templateId = url.searchParams.get('templateId');
                const issuerId = url.searchParams.get('issuerId');
    
                if (templateId && issuerId) {
                    openAddTicketDialog(templateId, issuerId);
                    router.back();
                } else {
                    throw new Error("Invalid QR code for this action.");
                }

            } else if (mode === 'redeem' && parsedData.type === 'ticket_redemption') {
                setDialogData(parsedData);
            } else {
              throw new Error("Unsupported QR code format for this action.");
            }
    
          } catch (e: any) {
            toast({ variant: 'destructive', title: "Invalid QR Code", description: e.message || "This QR code is not valid." });
            setTimeout(resetScanner, 2000);
          }
        }
      }, [scanResult, isProcessing, mode, openAddTicketDialog, router, toast, resetScanner]);

    const handleRedeemTicket = useCallback(async () => {
        if (!dialogData || !dialogData.ticketId || !dialogData.userId) return;

        try {
            await useTicket(dialogData.ticketId, dialogData.userId);
            toast({ title: d_tickets.ticketUsedSuccess });
            router.push('/tickets');
        } catch (error: any) {
            if (error.message.includes('already been used') || error.message.includes('expired')) {
                 setRedeemError(error.message);
            } else {
                toast({ variant: 'destructive', title: d_tickets.ticketUsedError, description: error.message });
                resetScanner();
            }
        } finally {
            setDialogData(null);
        }
    }, [dialogData, useTicket, toast, d_tickets, router, resetScanner]);

    const backPath = mode === 'add' ? '/wallet' : '/tickets';
    const pageTitle = mode === 'add' ? d_wallet.scanTicketTitle : d_tickets.scanUserTicket;

    const renderDialog = () => {
        if (redeemError) {
             const isExpired = redeemError.includes('expired');
             return (
                 <AlertDialog open={true} onOpenChange={() => !isProcessing && resetScanner()}>
                     <AlertDialogContent>
                         <AlertDialogHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                {isExpired ? <TicketX className="h-16 w-16 text-destructive" /> : <TicketCheck className="h-16 w-16 text-destructive" />}
                            </div>
                             <AlertDialogTitle>{isExpired ? d_tickets.ticketExpired : d_tickets.ticketAlreadyUsed}</AlertDialogTitle>
                             <AlertDialogDescription>
                                {isExpired ? d_tickets.ticketExpiredDescription : d_tickets.ticketAlreadyUsedDescription}
                             </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                             <AlertDialogAction onClick={() => router.push('/tickets')}>{d_tickets.backToList}</AlertDialogAction>
                         </AlertDialogFooter>
                     </AlertDialogContent>
                 </AlertDialog>
             )
        }

        if (dialogData && mode === 'redeem' && dialogData.type === 'ticket_redemption') {
             return (
                <AlertDialog open={true} onOpenChange={() => !isProcessing && resetScanner()}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{d_tickets.confirmRedemption}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {d_tickets.confirmRedemptionDescription}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={resetScanner}>No</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRedeemTicket}>Yes</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            );
        }
        
        return null;
    }

    return (
        <div className="space-y-6">
            <LoadingOverlay isLoading={isProcessing && !!scanResult && !dialogData && !redeemError} />
            <header className="relative flex items-center justify-center h-14">
                <Link href={backPath} className="absolute left-0">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold">{pageTitle}</h1>
            </header>
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-secondary flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                <div className="absolute inset-0 border-[20px] border-black/30 rounded-xl shadow-[0_0_0_100vmax_rgba(0,0,0,0.5)]" />
                <canvas ref={canvasRef} className="hidden" />
            </div>
             {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please grant camera access in your browser settings.
                    </AlertDescription>
                </Alert>
            )}
            {renderDialog()}
        </div>
    );
}
