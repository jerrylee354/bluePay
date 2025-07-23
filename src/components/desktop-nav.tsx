
"use client";

import React from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import {
  Home,
  History,
  CircleDollarSign,
  Wallet as WalletIcon,
  Package,
  LayoutDashboard,
  Ticket
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import SettingsContainer from './settings-container';
import { Dictionary } from '@/dictionaries';
import VerifiedAvatar from './VerifiedAvatar';


export default function DesktopNav({ dictionary, settingsDictionary }: { dictionary: Dictionary['nav'], settingsDictionary: Dictionary }) {
  const { user, userData } = useAuth();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const router = useRouter();
  const isBusiness = userData?.accountType === 'business';

  const personalNavItems = [
    { href: "/home", label: dictionary.home, icon: Home },
    { href: "/activity", label: dictionary.activity, icon: History },
    { href: "/pay", label: dictionary.pay, icon: CircleDollarSign },
    { href: "/wallet", label: dictionary.wallet, icon: WalletIcon },
  ];

  const businessNavItems = [
    { href: "/home", label: dictionary.home, icon: Home },
    { href: "/dashboard", label: dictionary.dashboard, icon: LayoutDashboard },
    { href: "/orders", label: dictionary.orders, icon: Package },
    { href: "/tickets", label: dictionary.tickets, icon: Ticket },
  ];

  const navItems = isBusiness ? businessNavItems : personalNavItems;

  const NavLink = ({ item, isExpanded }: { item: typeof navItems[0], isExpanded: boolean }) => {
      const pathname = usePathname();
      const isActive = pathname.startsWith(item.href);

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

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
  }

  const handleClose = () => {
    setIsDialogOpen(false);
  }

  return (
    <nav 
        className={cn(
            "hidden md:flex flex-col h-screen border-r bg-background transition-[width] duration-300 ease-in-out",
            isExpanded ? "w-60" : "w-20"
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col flex-grow p-4 gap-4">
        <Link 
            href="/home" 
            className={cn(
                "flex items-center h-12 w-full px-4 font-semibold shrink-0",
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
        
        <div className="flex-grow">
          {navItems.map((item) => (
              <NavLink key={item.href} item={item} isExpanded={isExpanded} />
          ))}
        </div>

        <div className="shrink-0">
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild>
                  <button className={cn(
                      "flex items-center h-12 w-full px-4 rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        isExpanded ? "justify-start gap-4" : "justify-center"
                  )}>
                      <VerifiedAvatar user={userData} className="h-9 w-9" />
                    <div className={cn("flex flex-col items-start text-left transition-all duration-200", isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden")}>
                        <p className="font-semibold text-sm leading-tight whitespace-nowrap">{userData?.firstName || "User"}</p>
                        <p className="text-xs text-muted-foreground leading-tight">{settingsDictionary.settings.title}</p>
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl p-0 max-h-[90vh] flex flex-col">
                  <DialogHeader className="sr-only">
                    <DialogTitle>{settingsDictionary.settings.title}</DialogTitle>
                  </DialogHeader>
                  <SettingsContainer
                    dictionary={settingsDictionary}
                    onClose={handleClose}
                  />
                </DialogContent>
          </Dialog>
        </div>
      </div>
    </nav>
  );
}
