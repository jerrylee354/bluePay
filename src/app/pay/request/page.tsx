
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import QRCode from 'qrcode.react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';

export default function RequestPage() {
    const pathname = usePathname();
    const { user: currentUser, userData } = useAuth();

    const [qrValue, setQrValue] = useState('');
    const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);

     useEffect(() => {
        if (typeof window !== 'undefined' && currentUser) {
            const baseUrl = window.location.origin;
            setQrValue(`${baseUrl}/pay/confirm?userId=${currentUser.uid}`);
        }
    }, [currentUser]);

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.charAt(0).toUpperCase();
    }
    
    const getDisplayUsername = () => {
        if (!userData) return '';
        const { username, firstName } = userData;
        if (username) {
            return username.startsWith('@') ? username : `@${username}`;
        }
        return `@${firstName?.toLowerCase() || 'user'}`;
    }

    return (
        <div className="flex flex-col h-full md:relative md:min-h-[calc(100vh-9rem)]">
            <header className="mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold">付款和要求付款</h1>
            </header>
            
            <div className="flex-grow">
                <Card>
                    <CardContent className="p-0">
                        <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
                            <DialogTrigger asChild>
                                 <div className="block hover:bg-muted/50 transition-colors rounded-t-xl cursor-pointer">
                                    <div className="flex items-center gap-4 p-4">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <QrCode className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">出示 QR Code</p>
                                            <p className="text-sm text-muted-foreground">顯示您的 QR Code 以收款</p>
                                        </div>
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="text-center">向他人收款</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col items-center justify-center text-center px-4 py-6 space-y-6">
                                    <div className="p-4 bg-white rounded-lg border flex items-center justify-center">
                                        {qrValue ? (
                                            <QRCode value={qrValue} size={192} />
                                        ) : (
                                            <Skeleton className="h-[192px] w-[192px]" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={userData?.photoURL || ''} alt="User Avatar" />
                                            <AvatarFallback>{getInitials(currentUser?.email)}</AvatarFallback>
                                        </Avatar>
                                        <div className="text-left">
                                            <p className="font-bold text-lg">{userData?.firstName} {userData?.lastName}</p>
                                            <p className="text-muted-foreground">{getDisplayUsername()}</p>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Separator />

                        <Link href="/pay/group" className="block hover:bg-muted/50 transition-colors rounded-b-xl">
                            <div className="flex items-center gap-4 p-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">群組付款</p>
                                    <p className="text-sm text-muted-foreground">建立群組以分攤款項</p>
                                </div>
                            </div>
                        </Link>
                    </CardContent>
                </Card>
            </div>
            
            <div className="flex-shrink-0 mt-auto pt-4 md:absolute md:bottom-8 md:left-1/2 md:-translate-x-1/2">
                <div className="flex w-full justify-center">
                    <div className="inline-flex items-center bg-secondary p-1 rounded-full shadow-md">
                         <Button 
                            asChild
                            className={cn("rounded-full h-11 w-32 text-base font-semibold transition-colors duration-300", 
                                pathname === '/pay' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted/50'
                            )}
                        >
                            <Link href="/pay">付款</Link>
                        </Button>
                        <Button 
                            asChild
                            className={cn("rounded-full h-11 w-32 text-base font-semibold transition-colors duration-300", 
                                pathname === '/pay/request' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted/50'
                            )}
                        >
                             <Link href="/pay/request">要求付款</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
