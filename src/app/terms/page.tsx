
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        setLastUpdated(new Date().toLocaleDateString());
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="relative mb-4 flex items-center justify-center">
                    <div className="absolute left-0">
                         <Button asChild variant="ghost" size="icon">
                           <Link href="/signup">
                                <ChevronLeft className="h-6 w-6" />
                                <span className="sr-only">Back</span>
                           </Link>
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold text-center">Terms of Service</h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Agreement to Terms</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p>Last updated: {lastUpdated}</p>
                        <p>
                           By using our services, you are agreeing to these terms. Please read them carefully. Our services are very diverse, so sometimes additional terms or product requirements (including age requirements) may apply. Additional terms will be available with the relevant services, and those additional terms become part of your agreement with us if you use those services.
                        </p>
                        <h3 className="font-semibold text-foreground pt-2">Using our Services</h3>
                        <p>
                            You must follow any policies made available to you within the Services. Don’t misuse our Services. For example, don’t interfere with our Services or try to access them using a method other than the interface and the instructions that we provide. You may use our Services only as permitted by law, including applicable export and re-export control laws and regulations.
                        </p>
                        <h3 className="font-semibold text-foreground pt-2">Your BluePay Account</h3>
                         <p>
                           You may need a BluePay Account in order to use some of our Services. You may create your own BluePay Account, or your BluePay Account may be assigned to you by an administrator, such as your employer or educational institution. If you are using a BluePay Account assigned to you by an administrator, different or additional terms may apply and your administrator may be able to access or disable your account.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
