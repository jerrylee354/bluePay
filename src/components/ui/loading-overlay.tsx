
"use client";

import { Loader } from 'lucide-react';

export const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Loader className="h-16 w-16 animate-spin-slow text-primary" />
        </div>
    );
};
