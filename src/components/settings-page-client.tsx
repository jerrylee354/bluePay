
"use client";

import SettingsContainer from '@/components/settings-container';
import { useRouter } from 'next/navigation';
import { type Dictionary } from '@/dictionaries';

export default function SettingsPageClient({ dictionary }: { dictionary: Dictionary }) {
    const router = useRouter();

    const handleClose = () => {
        router.back();
    };
    
    return (
      <SettingsContainer
        dictionary={dictionary}
        onClose={handleClose}
      />
    );
}
