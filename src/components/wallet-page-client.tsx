

"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { Plus, Ticket as TicketIcon } from 'lucide-react';
import { Dictionary } from '@/dictionaries';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { WalletItem } from '@/lib/data';
import QRCode from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import VerifiedAvatar from './VerifiedAvatar';
import { DocumentData } from 'firebase/firestore';


const TicketCard = ({ ticket, issuer, onClick }: { ticket: WalletItem, issuer: DocumentData | null, onClick: () => void }) => {
    
    const isExpired = ticket.expiresAt && new Date(ticket.expiresAt) < new Date();
    const cardStyle = {
        backgroundColor: ticket.style?.backgroundColor || '#4f46e5',
        color: ticket.style?.textColor || '#ffffff',
    };

    return (
        <button 
            onClick={onClick} 
            className="w-full text-left group transition-transform duration-300 ease-in-out will-change-transform" 
            disabled={isExpired}
            style={{ perspective: '1000px' }}
        >
            <div 
                className="rounded-lg p-4 text-white shadow-md transition-all duration-300 flex flex-col h-full relative overflow-hidden group-hover:shadow-xl group-hover:-translate-y-1"
                style={cardStyle}
            >
                {isExpired && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <p className="font-bold text-lg -rotate-12">EXPIRED</p>
                    </div>
                )}
                <div className="flex-1">
                    <div className="flex items-start gap-4">
                         {issuer ? (
                             <VerifiedAvatar user={issuer} className="w-10 h-10 border-2 border-white/50" showBadge={false} />
                        ) : (
                             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <TicketIcon className="w-6 h-6 opacity-50" />
                             </div>
                        )}
                        <div>
                            <p className="text-sm opacity-80">{ticket.issuerName}</p>
                            <h3 className="text-xl font-bold">{ticket.title}</h3>
                        </div>
                    </div>
                    <p className="text-sm opacity-90 mt-2 line-clamp-2">{ticket.description}</p>
                </div>

                <div className="mt-4 pt-2 border-t border-white/20 text-xs opacity-80">
                     {ticket.expiresAt ? `Expires: ${new Date(ticket.expiresAt).toLocaleDateString()}` : 'No Expiration'}
                </div>
            </div>
        </button>
    );
};


const WalletSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
    </div>
)

export default function WalletPageClient({ dictionary }: { dictionary: Dictionary}) {
    const d = dictionary.wallet;
    const { user, userData, walletItems, isLoading: isAuthLoading, getUserById } = useAuth();
    const router = useRouter();
    const [selectedTicket, setSelectedTicket] = useState<WalletItem | null>(null);
    const [qrValue, setQrValue] = useState('');
    const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
    const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);
    const [selectionGroup, setSelectionGroup] = useState<WalletItem[]>([]);
    const [issuers, setIssuers] = useState<Record<string, DocumentData | null>>({});
    const [isLoadingIssuers, setIsLoadingIssuers] = useState(true);

    useEffect(() => {
        if (!isAuthLoading && userData?.accountType === 'business') {
            router.push('/home');
        }
    }, [userData, isAuthLoading, router]);


    useEffect(() => {
      const fetchIssuers = async () => {
        setIsLoadingIssuers(true);
        const issuerIds = [...new Set(walletItems.map(item => item.issuerId))];
        const newIssuersToFetch = issuerIds.filter(id => !issuers[id]);
        
        if (newIssuersToFetch.length > 0) {
          const fetchedIssuers: Record<string, DocumentData | null> = {};
          await Promise.all(newIssuersToFetch.map(async (id) => {
            const issuerData = await getUserById(id);
            fetchedIssuers[id] = issuerData;
          }));
          setIssuers(prev => ({ ...prev, ...fetchedIssuers }));
        }
        setIsLoadingIssuers(false);
      };

      if (walletItems.length > 0) {
        fetchIssuers();
      } else {
        setIsLoadingIssuers(false);
      }
    }, [walletItems, getUserById]);


    const groupedTickets = useMemo(() => {
        const validTickets = walletItems.filter(item => {
            const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date();
            return item.status === 'valid' && !isExpired;
        });

        return validTickets.reduce((acc, ticket) => {
            const key = ticket.templateId;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(ticket);
            return acc;
        }, {} as Record<string, WalletItem[]>);
    }, [walletItems]);

    const handleTicketClick = (ticket: WalletItem) => {
        if (user) {
            const redemptionData = { type: 'ticket_redemption', ticketId: ticket.id, userId: user.uid };
            setQrValue(JSON.stringify(redemptionData));
            setSelectedTicket(ticket);
            setIsQrDialogOpen(true);
        }
    };

    const TicketStack = ({ tickets }: { tickets: WalletItem[] }) => {
        const baseTicket = tickets[0];
        const count = tickets.length;
        const issuer = issuers[baseTicket.issuerId];
        
        const handleStackClick = () => {
            if(count > 1) {
                setSelectionGroup(tickets);
                setIsSelectionDialogOpen(true);
            } else {
                handleTicketClick(baseTicket);
            }
        };

        return (
            <div 
                className="relative w-full cursor-pointer group"
                onClick={handleStackClick}
            >
                <div className="relative h-40">
                    {tickets.slice(0, 3).map((ticket, index) => (
                        <div
                            key={ticket.id}
                            className={cn(
                                "absolute inset-0 rounded-lg transition-transform duration-300 ease-in-out",
                                "group-hover:-translate-y-1"
                            )}
                            style={{
                                transform: `translate(${index * 4}px, ${index * 4}px)`,
                                zIndex: count - index,
                            }}
                        >
                            <TicketCard ticket={ticket} issuer={issuer} onClick={() => {}} />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const handleSelectFromDialog = (ticket: WalletItem) => {
        setIsSelectionDialogOpen(false);
        handleTicketClick(ticket);
    };
    
    if (isAuthLoading || isLoadingIssuers || !userData) {
        return <LoadingOverlay isLoading={true} />;
    }

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{d.title}</h1>
                 <Button variant="outline" size="icon" onClick={() => router.push(`/${dictionary.locale}/wallet/scan`)}>
                    <Plus className="h-5 w-5"/>
                </Button>
            </header>

            {isAuthLoading ? (
                <WalletSkeleton />
            ) : Object.keys(groupedTickets).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {Object.values(groupedTickets).map((ticketGroup, index) => (
                       <TicketStack key={index} tickets={ticketGroup} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center space-y-4 text-center p-8 bg-secondary rounded-xl min-h-[300px]">
                    <TicketIcon className="w-16 h-16 text-muted-foreground" />
                    <p className="font-semibold text-lg">{d.noTicketsTitle}</p>
                    <p className="text-sm text-muted-foreground">{d.noTicketsDescription}</p>
                     <Button onClick={() => router.push(`/${dictionary.locale}/wallet/scan`)}>
                        {d.addFirstTicket}
                    </Button>
                </div>
            )}
            
            <Dialog open={isSelectionDialogOpen} onOpenChange={setIsSelectionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select a Ticket</DialogTitle>
                        <DialogDescription>
                            You have multiple tickets of this type. Please choose one to use.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto -mx-6 px-6 pt-2">
                        <ul className="space-y-2">
                            {selectionGroup.map(ticket => {
                                const issuer = issuers[ticket.issuerId];
                                return (
                                    <li key={ticket.id}>
                                        <button 
                                            onClick={() => handleSelectFromDialog(ticket)}
                                            className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-4"
                                        >
                                            {issuer && <VerifiedAvatar user={issuer} className="w-10 h-10 flex-shrink-0" showBadge={false}/>}
                                            <div className="flex-1">
                                                <p className="font-semibold">{ticket.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Added on: {new Date(ticket.addedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
                <DialogContent
                    className="p-0 border-0 max-w-sm"
                    style={selectedTicket ? { 
                        backgroundColor: selectedTicket.style?.backgroundColor || '#4f46e5',
                        color: selectedTicket.style?.textColor || '#ffffff',
                    } : {}}
                >
                    {selectedTicket && (
                        <div className="relative">
                            <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                                <p className="font-semibold text-sm opacity-90">{d.showTicketToMerchant}</p>
                                <div className="p-4 bg-white rounded-lg border">
                                    {qrValue ? <QRCode value={qrValue} size={192} /> : <Skeleton className="w-[192px] h-[192px]" />}
                                </div>
                                <div>
                                    <p className="text-sm opacity-80">{selectedTicket.issuerName}</p>
                                    <h3 className="text-xl font-bold">{selectedTicket.title}</h3>
                                    {selectedTicket.expiresAt && <p className="text-xs opacity-80 mt-2">Expires: {new Date(selectedTicket.expiresAt).toLocaleDateString()}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
