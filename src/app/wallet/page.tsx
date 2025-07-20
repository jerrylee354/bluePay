
"use client";

import { Wallet as WalletIcon } from 'lucide-react';

export default function WalletPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold">Wallet</h1>
            </header>
             <div className="flex flex-col items-center justify-center space-y-4 text-center p-8 bg-secondary rounded-xl min-h-[300px]">
                <WalletIcon className="w-16 h-16 text-muted-foreground" />
                <p className="text-muted-foreground">Wallet feature is under construction.</p>
            </div>
        </div>
    );
}
