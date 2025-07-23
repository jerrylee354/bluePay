
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Plus, Ticket as TicketIcon } from 'lucide-react';
import { Dictionary } from '@/dictionaries';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { WalletItem, TicketTemplate } from '@/lib/data';
import QRCode from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

const TicketCard = ({ ticket, onClick }: { ticket: WalletItem, onClick: () => void }) => {
    
    const isExpired = ticket.expiresAt && new Date(ticket.expiresAt) < new Date();
    const cardStyle = {
        backgroundColor: ticket.style?.backgroundColor || '#4f46e5',
        color: ticket.style?.textColor || '#ffffff',
    };

    return (
        <button onClick={onClick} className="w-full text-left group" disabled={isExpired}>
            <div 
                className="rounded-lg p-4 text-white shadow-md transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                style={cardStyle}
            >
                {isExpired && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <p className="font-bold text-lg -rotate-12">EXPIRED</p>
                    </div>
                )}
                <div className="flex-1 group-hover:scale-105 transition-transform duration-300">
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
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
    </div>
)

export default function WalletPageClient({ dictionary }: { dictionary: Dictionary}) {
    const d = dictionary.wallet;
    const { user, walletItems, isLoading } = useAuth();
    const router = useRouter();
    const [selectedTicket, setSelectedTicket] = useState<WalletItem | null>(null);

    const validTickets = walletItems.filter(item => item.status === 'valid');

    const handleTicketClick = (ticket: WalletItem) => {
        setSelectedTicket(ticket);
    }
    
    const qrValue = selectedTicket && user ? JSON.stringify({ type: 'ticket_redemption', ticketId: selectedTicket.id, userId: user.uid }) : '';

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
            ) : validTickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {validTickets.map(ticket => (
                        <TicketCard key={ticket.id} ticket={ticket} onClick={() => handleTicketClick(ticket)} />
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
            
            <Dialog open={!!selectedTicket} onOpenChange={(isOpen) => !isOpen && setSelectedTicket(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-center">{d.showTicketToMerchant}</DialogTitle>
                    </DialogHeader>
                    {selectedTicket && (
                        <div className="flex flex-col items-center justify-center text-center p-4 space-y-4">
                            <div className="p-4 bg-white rounded-lg border">
                                <QRCode value={qrValue} size={192} />
                            </div>
                            <div 
                                className="w-full rounded-lg p-4 text-white shadow-md"
                                style={{ 
                                    backgroundColor: selectedTicket.style?.backgroundColor || '#4f46e5',
                                    color: selectedTicket.style?.textColor || '#ffffff',
                                }}
                            >
                                <p className="text-sm opacity-80">{selectedTicket.issuerName}</p>
                                <h3 className="text-xl font-bold">{selectedTicket.title}</h3>
                                {selectedTicket.expiresAt && <p className="text-xs opacity-80 mt-2">Expires: {new Date(selectedTicket.expiresAt).toLocaleDateString()}</p>}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
