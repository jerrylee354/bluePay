import { type Locale } from '../../../i18n';
import { getDictionary, type Dictionary } from '@/dictionaries';
import React from 'react';

export const dynamic = 'force-dynamic';

export default async function AppGroupLayout({
  children,
  params,
}: {
  children: React.ReactNode,
  params: { lang: Locale }
}) {
  const dictionary = await getDictionary(params.lang);
  
  // Pass dictionary to children that need it
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // @ts-ignore
      return React.cloneElement(child, { dictionary: dictionary });
    }
    return child;
  });

  return <>{childrenWithProps}</>;
}
