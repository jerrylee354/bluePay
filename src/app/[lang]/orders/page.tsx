
"use client";

import RequestPageClient from '@/components/request-page-client';
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

    return <RequestPageClient dictionary={dictionary} />;
}
