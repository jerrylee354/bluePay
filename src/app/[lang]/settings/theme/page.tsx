
"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SettingsPage } from '@/components/settings-container';
import { Dictionary } from '@/dictionaries';
import { cn } from "@/lib/utils";

const ThemeOption = ({ icon: Icon, label, value, currentTheme, setTheme }: { icon: React.ElementType, label: string, value: string, currentTheme?: string, setTheme: (theme: string) => void }) => (
    <button 
        className={cn(
            "flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-lg transition-colors w-full",
            currentTheme === value ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted/50"
        )}
        onClick={() => setTheme(value)}
    >
        <Icon className={cn("w-10 h-10", currentTheme === value ? "text-primary" : "text-muted-foreground")} />
        <span className="font-medium">{label}</span>
    </button>
);


export default function ThemeSettingsPage({ setPage, dictionary }: { setPage?: (page: SettingsPage) => void, dictionary: Dictionary['settings'] }) {
    const { theme, setTheme } = useTheme();
    const d = dictionary.theme;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{d.title}</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="grid grid-cols-3 gap-4">
                        <ThemeOption icon={Sun} label={d.light} value="light" currentTheme={theme} setTheme={setTheme} />
                        <ThemeOption icon={Moon} label={d.dark} value="dark" currentTheme={theme} setTheme={setTheme} />
                        <ThemeOption icon={Laptop} label={d.system} value="system" currentTheme={theme} setTheme={setTheme} />
                   </div>
                </CardContent>
            </Card>
        </div>
    );
}
