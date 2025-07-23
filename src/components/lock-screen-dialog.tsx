
"use client";

import { Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dictionary } from '@/dictionaries';

interface LockScreenDialogProps {
    onConfirm: () => void;
    dictionary: Dictionary['lockScreen'];
}

export function LockScreenDialog({ onConfirm, dictionary }: LockScreenDialogProps) {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm p-4">
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <Lock className="w-16 h-16 text-primary" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">{dictionary.title}</h1>
                    <p className="text-muted-foreground text-lg max-w-sm mx-auto">{dictionary.description}</p>
                </div>
                 <Button onClick={onConfirm} className="w-full max-w-xs h-12 text-lg font-semibold">
                    {dictionary.unlock}
                </Button>
            </div>
        </div>
    );
}
