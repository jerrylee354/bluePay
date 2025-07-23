
"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dictionary } from '@/dictionaries';
import { usePayDialogStore } from '@/stores/pay-dialog-store';

export default function ScanToPayPageClient({ dictionary }: { dictionary: Dictionary}) {
    const d = dictionary.pay.scanQrCode;
    const router = useRouter();
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { setSelectedUser } = usePayDialogStore();

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
                toast({
                    variant: 'destructive',
                    title: d.cameraAccessDeniedTitle,
                    description: d.cameraAccessDeniedDescription,
                });
            }
        };

        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [toast, d]);

    useEffect(() => {
        if (!hasCameraPermission || scanResult || isProcessing) return;

        let animationFrameId: number;

        const tick = () => {
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
                            setScanResult(code.data);
                        }
                    }
                }
            }
            animationFrameId = requestAnimationFrame(tick);
        };

        animationFrameId = requestAnimationFrame(tick);
        
        return () => cancelAnimationFrame(animationFrameId);

    }, [hasCameraPermission, scanResult, isProcessing]);

    useEffect(() => {
        if (scanResult && !isProcessing) {
            setIsProcessing(true);
            try {
                const url = new URL(scanResult);
                const userId = url.searchParams.get('userId');
                const mode = url.searchParams.get('mode') || 'pay';

                if (url.pathname.includes('/pay/confirm') && userId) {
                     // For mobile, navigate. For desktop, set store and go back.
                    if (window.innerWidth < 768) { // A simple check for mobile
                        router.push(url.pathname + url.search);
                    } else {
                        setSelectedUser(userId, mode as 'pay' | 'request');
                        router.back();
                    }
                } else {
                    throw new Error(d.invalidQrError);
                }
            } catch (e) {
                toast({ variant: 'destructive', title: d.invalidQrTitle, description: d.invalidQrError });
                setTimeout(() => {
                    setScanResult(null);
                    setIsProcessing(false);
                }, 2000);
            }
        }
    }, [scanResult, toast, router, isProcessing, d, setSelectedUser]);

    return (
        <div className="space-y-6">
            <header className="relative flex items-center justify-center h-14">
                <Link href="/pay" className="absolute left-0">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Pay</span>
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold">{d.title}</h1>
            </header>
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-secondary flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                <div className="absolute inset-0 border-[20px] border-black/30 rounded-xl shadow-[0_0_0_100vmax_rgba(0,0,0,0.5)]" />
                <canvas ref={canvasRef} className="hidden" />
            </div>
             {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{d.cameraAccessRequiredTitle}</AlertTitle>
                    <AlertDescription>
                        {d.cameraAccessRequiredDescription}
                    </AlertDescription>
                </Alert>
            )}
            <p className="text-center text-muted-foreground">
                {scanResult ? d.processing : d.alignQrCode}
            </p>
        </div>
    );
}
