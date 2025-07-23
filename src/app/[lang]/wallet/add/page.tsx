
import { Suspense } from 'react';
import AddTicketPageClient from '@/components/add-ticket-page-client';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { getDictionary } from '@/dictionaries';
import { type Locale } from '@/i18n';

export default async function AddTicketPage({
    params,
    searchParams,
}: {
    params: { lang: Locale };
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const dictionary = await getDictionary(params.lang);
    const templateId = typeof searchParams.templateId === 'string' ? searchParams.templateId : null;
    const issuerId = typeof searchParams.issuerId === 'string' ? searchParams.issuerId : null;

    return (
        <Suspense fallback={<LoadingOverlay isLoading={true} />}>
            <AddTicketPageClient
                dictionary={dictionary}
                templateId={templateId}
                issuerId={issuerId}
            />
        </Suspense>
    );
}
