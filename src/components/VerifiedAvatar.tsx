
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentData } from "firebase/firestore";

interface VerifiedAvatarProps {
    user: DocumentData | null;
    className?: string;
    fallbackClassName?: string;
    showBadge?: boolean;
}

const getInitials = (user: DocumentData | null) => {
    if (!user) return "?";
    if (user.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "?";
}

export default function VerifiedAvatar({ user, className, fallbackClassName, showBadge = true }: VerifiedAvatarProps) {
    if (!user) return null;

    const isVerified = user.verify === 'Yes';
    const isBusiness = user.accountType === 'business';

    const renderBadge = () => {
        if (!showBadge) return null;

        if (isBusiness) {
            return (
                 <div className={cn(
                    "absolute bottom-0 right-0 h-5 w-5 rounded-full flex items-center justify-center",
                    isVerified ? "bg-primary" : "bg-muted"
                )}>
                    <Store className={cn("h-4 w-4", isVerified ? "text-primary-foreground" : "text-muted-foreground")} />
                </div>
            )
        }
        
        if (isVerified) {
            return (
                 <div className="absolute bottom-0 right-0 h-5 w-5 bg-background rounded-full flex items-center justify-center">
                    <BadgeCheck className="h-5 w-5 text-primary fill-primary-foreground stroke-primary-foreground" />
                </div>
            )
        }

        return null;
    };
    
    return (
        <div className="relative">
            <Avatar className={cn("h-10 w-10", className)}>
                <AvatarImage src={user.photoURL} alt={user.firstName || "User Avatar"} />
                <AvatarFallback className={cn(fallbackClassName)}>
                    {getInitials(user)}
                </AvatarFallback>
            </Avatar>
            {renderBadge()}
        </div>
    );
}
