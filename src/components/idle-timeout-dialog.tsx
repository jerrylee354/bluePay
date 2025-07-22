
"use client";

import { AlertTriangle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dictionary } from '@/dictionaries';

interface IdleTimeoutDialogProps {
    onConfirm: () => void;
    dictionary: Dictionary['idleTimeout'];
}

export function IdleTimeoutDialog({ onConfirm, dictionary }: IdleTimeoutDialogProps) {
    return (
        <AlertDialog open={true}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex justify-center mb-4">
                        <AlertTriangle className="h-16 w-16 text-destructive" />
                    </div>
                    <AlertDialogTitle className="text-center">{dictionary.title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        {dictionary.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogAction onClick={onConfirm}>{dictionary.confirm}</AlertDialogAction>
            </AlertDialogContent>
        </AlertDialog>
    );
}
