
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

interface IdleTimeoutDialogProps {
    onConfirm: () => void;
}

export function IdleTimeoutDialog({ onConfirm }: IdleTimeoutDialogProps) {
    return (
        <AlertDialog open={true}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex justify-center mb-4">
                        <AlertTriangle className="h-16 w-16 text-destructive" />
                    </div>
                    <AlertDialogTitle className="text-center">工作階段已過時</AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        為保護您的帳戶安全，由於您長時間未活動，我們已將您登出。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogAction onClick={onConfirm}>確定</AlertDialogAction>
            </AlertDialogContent>
        </AlertDialog>
    );
}
