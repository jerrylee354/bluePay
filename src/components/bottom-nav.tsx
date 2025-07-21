
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, CircleDollarSign, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/activity", label: "Activity", icon: History },
  { href: "/pay", label: "Pay", icon: CircleDollarSign },
  { href: "/wallet", label: "Wallet", icon: Wallet },
];

export default function BottomNav() {
  const pathname = usePathname();
  
  if (pathname.startsWith('/settings')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full border-t bg-background/95 backdrop-blur-sm z-10 h-24 pt-2 pb-safe-bottom">
      <nav className="flex justify-around items-start h-full max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-md p-2 text-sm font-medium transition-colors w-1/4 h-full",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary/80"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
