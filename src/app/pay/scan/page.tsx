
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

export default function ScanToPayPage({ dictionary }: { dictionary: Dictionary['pay']['scanQrCode']}) {
    const router = useRouter();
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [scanResult, setScanResult] = useState<string | null>(null);
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
                toast({
                    variant: 'destructive',
                    title: dictionary.cameraAccessDeniedTitle,
                    description: dictionary.cameraAccessDeniedDescription,
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
    }, [toast, dictionary]);

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
                if (url.pathname.includes('/pay/confirm') && url.searchParams.has('userId')) {
                     router.push(url.pathname + url.search);
                } else {
                    throw new Error(dictionary.invalidQrError);
                }
            } catch (e) {
                toast({ variant: 'destructive', title: dictionary.invalidQrTitle, description: dictionary.invalidQrError });
                setTimeout(() => {
                    setScanResult(null);
                    setIsProcessing(false);
                }, 2000);
            }
        }
    }, [scanResult, toast, router, isProcessing, dictionary]);

    return (
        <div className="space-y-6">
            <header className="relative flex items-center justify-center h-14">
                <Link href="/pay" className="absolute left-0">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Pay</span>
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold">{dictionary.title}</h1>
            </header>
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-secondary flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                <div className="absolute inset-0 border-[20px] border-black/30 rounded-xl shadow-[0_0_0_100vmax_rgba(0,0,0,0.5)]" />
                <canvas ref={canvasRef} className="hidden" />
            </div>
             {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{dictionary.cameraAccessRequiredTitle}</AlertTitle>
                    <AlertDescription>
                        {dictionary.cameraAccessRequiredDescription}
                    </AlertDescription>
                </Alert>
            )}
            <p className="text-center text-muted-foreground">
                {scanResult ? dictionary.processing : dictionary.alignQrCode}
            </p>
        </div>
    );
}
