
"use client";

import React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import {
  Home,
  History,
  CircleDollarSign,
  Wallet as WalletIcon, 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import SettingsContainer, { type SettingsPage } from './settings-container';


const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/activity", label: "Activity", icon: History },
  { href: "/pay", label: "Pay", icon: CircleDollarSign },
  { href: "/wallet", label: "Wallet", icon: WalletIcon },
];

const NavLink = ({ item, isExpanded }: { item: typeof navItems[0], isExpanded: boolean }) => {
    const pathname = usePathname();
    const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);

    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href={item.href}
                        className={cn(
                            "flex items-center h-12 w-full px-4 rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                            isExpanded ? "justify-start gap-4" : "justify-center",
                            isActive && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                        )}
                    >
                        <item.icon className="h-6 w-6 shrink-0" />
                        <span className={cn("transition-all duration-200", isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden")}>{item.label}</span>
                    </Link>
                </TooltipTrigger>
                {!isExpanded && (
                    <TooltipContent side="right" sideOffset={5}>
                        {item.label}
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    )
}

export default function DesktopNav() {
  const { user, userData } = useAuth();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [settingsPage, setSettingsPage] = React.useState<SettingsPage>('main');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset to main settings page when dialog is closed
      setTimeout(() => setSettingsPage('main'), 200);
    }
  }

  return (
    <nav 
        className={cn(
            "hidden md:flex flex-col border-r bg-background p-4 gap-4 transition-[width] duration-300 ease-in-out",
            isExpanded ? "w-60" : "w-20"
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col items-center gap-2">
        <Link 
            href="/" 
            className={cn(
                "flex items-center h-12 w-full px-4 font-semibold",
                isExpanded ? "justify-start gap-4" : "justify-center"
            )}
        >
            <WalletIcon className="h-6 w-6 text-primary shrink-0" />
            <span className={cn(
                "font-bold transition-all duration-200", 
                isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
            )}>
                BluePay
            </span>
        </Link>
        
        {navItems.map((item) => (
            <NavLink key={item.href} item={item} isExpanded={isExpanded} />
        ))}
      </div>


      <div className="mt-auto flex flex-col items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild>
                  <button className={cn(
                      "flex items-center h-12 w-full px-4 rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        isExpanded ? "justify-start gap-4" : "justify-center"
                  )}>
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={userData?.photoURL || ""} alt="User Avatar" />
                        <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                    </Avatar>
                    <div className={cn("flex flex-col items-start text-left transition-all duration-200", isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden")}>
                        <p className="font-semibold text-sm leading-tight whitespace-nowrap">{userData?.firstName || "User"}</p>
                        <p className="text-xs text-muted-foreground leading-tight">Settings</p>
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl p-0">
                  <SettingsContainer page={settingsPage} setPage={setSettingsPage} />
                </DialogContent>
          </Dialog>
      </div>
    </nav>
  );
}
