
"use client";

import { Package } from 'lucide-react';
import { Dictionary } from '@/dictionaries';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';
import { useEffect, useState } from 'react';

// This is a temporary solution until we can get dictionary on server
async function getDictionaryClient(lang: Locale): Promise<Dictionary> {
    return await getDictionary(lang);
}

export default function OrdersPage({ params }: { params: { lang: Locale } }) {
    const [dictionary, setDictionary] = useState<Dictionary | null>(null);
    
    useEffect(() => {
        getDictionaryClient(params.lang).then(dict => setDictionary(dict));
    }, [params.lang]);

    if (!dictionary) {
        return null; // Or a loading spinner
    }
    
    const d = dictionary.orders;
    const navD = dictionary.nav;

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold">{navD.orders}</h1>
            </header>
             <div className="flex flex-col items-center justify-center space-y-4 text-center p-8 bg-secondary rounded-xl min-h-[300px]">
                <Package className="w-16 h-16 text-muted-foreground" />
                <p className="text-muted-foreground">{d.underConstruction}</p>
            </div>
        </div>
    );
}
