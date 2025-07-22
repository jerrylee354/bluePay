
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Wallet, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { type Dictionary } from '@/dictionaries';


const SeparatorWithText = ({text}: {text: string}) => (
    <div className="flex items-center" aria-hidden="true">
        <div className="flex-grow border-t border-border"></div>
        <span className="mx-4 flex-shrink text-sm text-muted-foreground">{text}</span>
        <div className="flex-grow border-t border-border"></div>
    </div>
);

export default function LoginPage({ dictionary }: { dictionary: Dictionary['login'] }) {
    const d = dictionary;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await login(email, password);
            toast({
                title: d.loginSuccessTitle,
                description: d.loginSuccessDescription,
            });
            router.push('/home');
        } catch (error: any) {
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                setError(d.loginErrorDescription);
            } else {
                setError(error.message);
            }
            toast({
                variant: "destructive",
                title: d.loginErrorTitle,
                description: d.loginErrorDescription,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
            <LoadingOverlay isLoading={isLoading} />
             <div className="w-full max-w-sm space-y-6 p-4 sm:rounded-lg sm:border sm:bg-card sm:p-8 sm:shadow-sm">
                <Link href="/" className="flex items-center justify-center gap-2">
                    <Wallet className="w-12 h-12 text-primary" />
                    <span className="text-4xl font-bold text-foreground">BluePay</span>
                </Link>
                <div className="space-y-4">
                    <h1 className="sr-only">{d.title}</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                         <Input
                            id="email"
                            type="email"
                            placeholder={d.emailPlaceholder}
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="h-12 text-base"
                        />
                         <Input 
                            id="password" 
                            type="password"
                            placeholder={d.passwordPlaceholder} 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading} 
                            className="h-12 text-base"
                        />
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>{d.loginErrorTitle}</AlertTitle>
                                <AlertDescription>
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="text-sm">
                            <Link href="#" className="font-medium text-primary hover:text-primary/90">
                                {d.forgotPassword}
                            </Link>
                        </div>
                        <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isLoading}>
                           {d.loginButton}
                        </Button>
                    </form>
                </div>
                <SeparatorWithText text={d.or} />
                <Button variant="outline" className="w-full h-12 text-lg font-bold" onClick={() => router.push('/signup')} disabled={isLoading}>
                    {d.signupButton}
                </Button>
            </div>
        </div>
    );
}
