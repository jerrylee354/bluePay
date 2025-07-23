
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, CircleDollarSign, Wallet, Package, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dictionary } from "@/dictionaries";
import { useAuth } from "@/context/auth-context";


export default function BottomNav({ dictionary }: { dictionary: Dictionary['nav']}) {
  const pathname = usePathname();
  const { userData } = useAuth();
  const isBusiness = userData?.accountType === 'business';

  const personalNavItems = [
    { href: "/home", label: dictionary.home, icon: Home },
    { href: "/activity", label: dictionary.activity, icon: History },
    { href: "/pay", label: dictionary.pay, icon: CircleDollarSign },
    { href: "/wallet", label: dictionary.wallet, icon: Wallet },
  ];

  const businessNavItems = [
    { href: "/home", label: dictionary.home, icon: Home },
    { href: "/dashboard", label: dictionary.dashboard, icon: LayoutDashboard },
    { href: "/orders", label: dictionary.orders, icon: Package },
    { href: "/pay", label: dictionary.pay, icon: CircleDollarSign },
  ];
  
  const navItems = isBusiness ? businessNavItems : personalNavItems;

  if (pathname.includes('/settings')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full border-t bg-background/95 backdrop-blur-sm z-50 h-20 pt-2 pb-safe-bottom">
      <nav className="grid grid-cols-4 justify-around items-start h-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-md p-2 text-sm font-medium transition-colors h-full",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary/80"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
