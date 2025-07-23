
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { ChevronLeft, AlertCircle } from 'lucide-react';
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

interface ScanTicketPageClientProps {
    dictionary: Dictionary;
    mode: 'add' | 'redeem';
}

interface ScannedTicketData {
    type: 'ticket_add' | 'ticket_redemption';
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
    const { addTicketToWallet, useTicket } = useAuth();
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [scanResult, setScanResult] = useState<ScannedTicketData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

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

                    if (code && code.data) {
                        try {
                            const parsedData = JSON.parse(code.data);
                            setScanResult(parsedData);
                            setIsProcessing(true); // Stop scanning
                        } catch (e) {
                            // Not a valid JSON, ignore
                        }
                    }
                }
            }
        }
    }, []);

    useEffect(() => {
        if (!hasCameraPermission || isProcessing) return;
        const intervalId = setInterval(handleScan, 200);
        return () => clearInterval(intervalId);
    }, [hasCameraPermission, isProcessing, handleScan]);

    const resetScanner = () => {
        setScanResult(null);
        setIsProcessing(false);
    }
    
    const handleAddTicket = async () => {
        if (!scanResult || !scanResult.templateId || !scanResult.issuerId) return;

        try {
            await addTicketToWallet(scanResult.templateId, scanResult.issuerId);
            toast({ title: d_wallet.addTicketSuccess });
            router.push('/wallet');
        } catch (error: any) {
            toast({ variant: 'destructive', title: d_wallet.addTicketError, description: error.message });
            resetScanner();
        }
    };

    const handleRedeemTicket = async () => {
        if (!scanResult || !scanResult.ticketId || !scanResult.userId) return;

        try {
            await useTicket(scanResult.ticketId, scanResult.userId);
            toast({ title: d_tickets.ticketUsedSuccess });
            router.push('/tickets');
        } catch (error: any) {
            toast({ variant: 'destructive', title: d_tickets.ticketUsedError, description: error.message });
            resetScanner();
        }
    };

    const backPath = mode === 'add' ? '/wallet' : '/tickets';
    const pageTitle = mode === 'add' ? d_wallet.scanTicketTitle : d_tickets.scanUserTicket;

    const renderDialog = () => {
        if (!scanResult) return null;

        if (mode === 'add' && scanResult.type === 'ticket_add') {
             return (
                <AlertDialog open={true} onOpenChange={() => !isProcessing && resetScanner()}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Add Ticket?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Do you want to add this ticket to your wallet?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={resetScanner}>Close</AlertDialogCancel>
                            <AlertDialogAction onClick={handleAddTicket}>Add</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            );
        }

        if (mode === 'redeem' && scanResult.type === 'ticket_redemption') {
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
        
        // Invalid QR for the current mode
        if (isProcessing) { // ensures this runs only once after scan
            toast({ variant: 'destructive', title: "Invalid QR Code", description: "This QR code cannot be used for this action." });
            setTimeout(resetScanner, 2000);
        }
        return null;
    }

    return (
        <div className="space-y-6">
            <LoadingOverlay isLoading={isProcessing && !!scanResult} />
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
