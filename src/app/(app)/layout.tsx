
"use client";
import { type Locale } from '../../../i18n';
import { getDictionary, type Dictionary } from '@/dictionaries';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

export default function AppGroupLayout({
  children,
  params,
}: {
  children: React.ReactNode,
  params: { lang: Locale }
}) {
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);

  useEffect(() => {
    getDictionary(params.lang).then(setDictionary);
  }, [params.lang]);
  
  // Pass dictionary to children that need it
  const childrenWithProps = dictionary ? React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // @ts-ignore
      return React.cloneElement(child, { dictionary: dictionary });
    }
    return child;
  }) : children;

  return <>{childrenWithProps}</>;
}
