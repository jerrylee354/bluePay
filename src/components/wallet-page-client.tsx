
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { Plus, Ticket as TicketIcon } from 'lucide-react';
import { Dictionary } from '@/dictionaries';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { WalletItem } from '@/lib/data';
import QRCode from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from './ui/dialog';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import VerifiedAvatar from './VerifiedAvatar';

const TicketCard = ({ ticket, onClick }: { ticket: WalletItem, onClick: () => void }) => {
    
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
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm opacity-80">{ticket.issuerName}</p>
                            <h3 className="text-xl font-bold">{ticket.title}</h3>
                        </div>
                        <TicketIcon className="w-8 h-8 opacity-50" />
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
    const { user, walletItems, isLoading } = useAuth();
    const router = useRouter();
    const [selectedTicket, setSelectedTicket] = useState<WalletItem | null>(null);
    const [qrValue, setQrValue] = useState('');
    const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
    const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);
    const [selectionGroup, setSelectionGroup] = useState<WalletItem[]>([]);

    const groupedTickets = useMemo(() => {
        const validTickets = walletItems.filter(item => item.status === 'valid');
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

        const handleStackClick = () => {
            if(count > 1) {
                setSelectionGroup(tickets);
                setIsSelectionDialogOpen(true);
            } else {
                handleTicketClick(baseTicket);
            }
        };

        const cardStyle = {
            backgroundColor: baseTicket.style?.backgroundColor || '#4f46e5',
            color: baseTicket.style?.textColor || '#ffffff',
        };

        return (
            <div 
                className="relative h-40 w-full cursor-pointer group"
                onClick={handleStackClick}
            >
                {tickets.slice(0, 3).map((ticket, index) => (
                    <div
                        key={ticket.id}
                        className={cn(
                            "absolute inset-0 rounded-lg p-4 text-white shadow-md transition-transform duration-300 ease-in-out",
                            "group-hover:-translate-y-1"
                        )}
                        style={{
                            transform: `translate(${index * 3}px, ${index * 3}px)`,
                            zIndex: count - index,
                            backgroundColor: ticket.style?.backgroundColor || '#4f46e5',
                            color: ticket.style?.textColor || '#ffffff',
                        }}
                    >
                         <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm opacity-80">{ticket.issuerName}</p>
                                    <h3 className="text-xl font-bold">{ticket.title}</h3>
                                </div>
                                <TicketIcon className="w-8 h-8 opacity-50" />
                            </div>
                        </div>
                    </div>
                ))}
                {count > 1 && (
                    <div className="absolute -top-2 -right-2 z-20">
                         <VerifiedAvatar user={null} count={count} />
                    </div>
                )}
            </div>
        )
    }

    const handleSelectFromDialog = (ticket: WalletItem) => {
        setIsSelectionDialogOpen(false);
        handleTicketClick(ticket);
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{d.title}</h1>
                 <Button variant="outline" size="icon" onClick={() => router.push('/wallet/scan')}>
                    <Plus className="h-5 w-5"/>
                </Button>
            </header>

            {isLoading ? (
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
                     <Button onClick={() => router.push('/wallet/scan')}>
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
                            {selectionGroup.map(ticket => (
                                <li key={ticket.id}>
                                    <button 
                                        onClick={() => handleSelectFromDialog(ticket)}
                                        className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <p className="font-semibold">{ticket.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Added on: {new Date(ticket.addedAt).toLocaleDateString()}
                                        </p>
                                    </button>
                                </li>
                            ))}
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

    