
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
    const [lastUpdated, setLastUpdated] = useState('');
    const router = useRouter();

    useEffect(() => {
        setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-3xl">
                 <div className="relative mb-6 flex items-center justify-center">
                    <div className="absolute left-0">
                         <Button variant="ghost" size="icon" onClick={() => router.back()}>
                                <ChevronLeft className="h-6 w-6" />
                                <span className="sr-only">Back</span>
                         </Button>
                    </div>
                    <h1 className="text-3xl font-bold text-center">Privacy Policy</h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Introduction</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Last updated: {lastUpdated}</p>
                        <p>
                            Welcome to BluePay. We respect your privacy and are committed to protecting your personal data. This privacy notice will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) or use our services and tell you about your privacy rights and how the law protects you.
                        </p>
                        <h3 className="font-semibold text-foreground pt-2">Information We Collect</h3>
                        <p>
                            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows: Identity Data, Contact Data, Financial Data, Transaction Data, Technical Data, Profile Data, Usage Data, and Marketing and Communications Data.
                        </p>
                         <h3 className="font-semibold text-foreground pt-2">How We Use Your Personal Data</h3>
                        <p>
                           We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances: Where we need to perform the contract we are about to enter into or have entered into with you. Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests. Where we need to comply with a legal or regulatory obligation.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
