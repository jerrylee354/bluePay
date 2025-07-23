
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, QrCode, Users, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { DocumentData } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-is-mobile';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import QRCode from 'qrcode.react';
import PaymentConfirm from '@/components/payment-confirm';
import { Dictionary } from '@/dictionaries';
import { usePayDialogStore } from '@/stores/pay-dialog-store';
import VerifiedAvatar from './VerifiedAvatar';

function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export default function RequestPageClient({ dictionary }: { dictionary: Dictionary }) {
    const pathname = usePathname();
    const router = useRouter();
    const { searchUsers, user: currentUser, userData } = useAuth();
    const isMobile = useIsMobile();
    const d = dictionary.pay;
    const { 
        isPayDialogOpen, 
        setPayDialogState,
        selectedUserId,
        mode,
        setSelectedUser,
    } = usePayDialogStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<DocumentData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showNoResults, setShowNoResults] = useState(false);
    
    const [qrValue, setQrValue] = useState('');
    const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const isCreateOrderPage = pathname.includes('/orders/create');

    useEffect(() => {
        if (userData && isCreateOrderPage && userData.accountType !== 'business') {
            router.push('/home');
        }
    }, [userData, isCreateOrderPage, router]);


    const handleSearch = useCallback(async (term: string) => {
        if (!term) {
            setResults([]);
            setShowNoResults(false);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setShowNoResults(false);
        try {
            const users = await searchUsers(term);
            const filteredUsers = users.filter(u => u.uid !== currentUser?.uid);
            setResults(filteredUsers);
            if (filteredUsers.length === 0) {
                setShowNoResults(true);
            }
        } catch (error) {
            console.error("Error searching users:", error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchUsers, currentUser]);

    useEffect(() => {
        if (debouncedSearchTerm) {
            handleSearch(debouncedSearchTerm);
        } else {
            setResults([]);
            setShowNoResults(false);
            setIsLoading(false);
        }
    }, [debouncedSearchTerm, handleSearch]);
    
     useEffect(() => {
        if (typeof window !== 'undefined' && currentUser) {
            const baseUrl = window.location.origin;
            const lang = dictionary.locale;
            setQrValue(`${baseUrl}/${lang}/pay/confirm?userId=${currentUser.uid}&mode=request`);
        }
    }, [currentUser, dictionary.locale]);

    
    const getDisplayUsername = () => {
        if (!userData) return '';
        const { username, firstName } = userData;
        if (username) {
            return username.startsWith('@') ? username : `@${username}`;
        }
        return `@${firstName?.toLowerCase() || 'user'}`;
    }

    const clearSearch = () => {
        setSearchTerm('');
    }
    
    const handleSelectUser = (user: DocumentData) => {
        const lang = dictionary.locale;
        const url = `/${lang}/pay/confirm?userId=${user.uid}&mode=request`;
        if (isMobile) {
            router.push(url);
        } else {
            setSelectedUser(user.uid, 'request');
        }
    }

    const handleDialogClose = () => {
        setPayDialogState(false);
    }
    
    const renderSearchResults = () => {
        if (isLoading) {
            return (
                <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-2">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-4 w-[100px]" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (results.length > 0) {
            return (
                <Card>
                    <CardContent className="p-0">
                        <ul className="divide-y">
                            {results.map(user => (
                                <li key={user.uid} onClick={() => handleSelectUser(user)} className="flex items-center p-4 space-x-4 hover:bg-muted/50 cursor-pointer">
                                    <VerifiedAvatar user={user} className="h-12 w-12" />
                                    <div>
                                        <p className="font-semibold">{user.firstName} {user.lastName}</p>
                                        <p className="text-sm text-muted-foreground">{user.username}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            );
        }

        if (showNoResults) {
            return (
                <div className="text-center p-8 text-muted-foreground">
                    <p>{d.noUsersFound.replace('{searchTerm}', searchTerm)}</p>
                </div>
            );
        }

        return null;
    }

    const renderDefaultContent = () => (
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
                                    <p className="font-semibold">{d.showQrCode.title}</p>
                                    <p className="text-sm text-muted-foreground">{d.showQrCode.description}</p>
                                </div>
                            </div>
                        </div>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-center">{d.receiveFromOthers}</DialogTitle>
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
                                <VerifiedAvatar user={userData} className="h-12 w-12" />
                                <div className="text-left">
                                    <p className="font-bold text-lg">{userData?.firstName} {userData?.lastName}</p>
                                    <p className="text-muted-foreground">{getDisplayUsername()}</p>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {userData?.accountType !== 'business' && (
                    <>
                        <Separator />
                        <Link href="/pay/group" className="block hover:bg-muted/50 transition-colors rounded-b-xl">
                            <div className="flex items-center gap-4 p-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{d.groupPayment}</p>
                                    <p className="text-sm text-muted-foreground">{d.splitBillWithGroup}</p>
                                </div>
                            </div>
                        </Link>
                    </>
                )}
            </CardContent>
        </Card>
    );

    const PageContent = () => (
        <div className="flex-grow overflow-y-auto pb-20 md:pb-0">
            {searchTerm.length > 0 ? renderSearchResults() : renderDefaultContent()}
        </div>
    );
    
    const showToggle = !isCreateOrderPage;

    return (
        <div className="flex flex-col h-full md:relative md:min-h-[calc(100vh-9rem)]">
            <header className="mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold">{isCreateOrderPage ? dictionary.orders.create.title : d.request}</h1>
            </header>

            <div className="relative mb-6 flex-shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder={d.searchPlaceholder}
                    className="h-14 pl-12 pr-12 rounded-full bg-secondary text-base border-0 focus-visible:ring-2 focus-visible:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full"
                        onClick={clearSearch}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>
            
            <PageContent />
            
            {showToggle && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 md:absolute md:bottom-0 md:left-1/2 md:-translate-x-1/2 md:pb-8">
                    <div className="flex w-full justify-center">
                        <div className="inline-flex items-center bg-secondary p-1 rounded-full shadow-md">
                             <Button 
                                asChild
                                className={cn("rounded-full h-11 w-32 text-base font-semibold transition-colors duration-300", 
                                    pathname.includes('/pay') && !pathname.includes('/request') ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted/50'
                                )}
                            >
                                <Link href="/pay">{d.pay}</Link>
                            </Button>
                            <Button 
                                asChild
                                className={cn("rounded-full h-11 w-32 text-base font-semibold transition-colors duration-300", 
                                    pathname.includes('/pay/request') || pathname.includes('/orders/create') ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-muted/50'
                                )}
                            >
                                 <Link href="/pay/request">{d.request}</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <Dialog open={isPayDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="p-0 max-w-4xl h-auto sm:max-h-[90vh] flex flex-col" hideCloseButton>
                    <DialogHeader className="sr-only">
                        <DialogTitle>Confirm Request</DialogTitle>
                    </DialogHeader>
                    {selectedUserId && (
                        <PaymentConfirm
                            isDialog={true}
                            onClose={handleDialogClose}
                            dictionary={dictionary}
                            userIdFromProps={selectedUserId}
                            modeFromProps={mode}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
