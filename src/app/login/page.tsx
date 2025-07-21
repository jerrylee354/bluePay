
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Wallet, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

const SeparatorWithText = () => (
    <div className="flex items-center" aria-hidden="true">
        <div className="flex-grow border-t border-border"></div>
        <span className="mx-4 flex-shrink text-sm text-muted-foreground">or</span>
        <div className="flex-grow border-t border-border"></div>
    </div>
);

export default function LoginPage() {
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
                title: "Login Successful",
                description: "Welcome back!",
            });
            router.push('/home');
        } catch (error: any) {
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                setError("Invalid email or password. Please try again.");
            } else {
                setError(error.message);
            }
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Please check your email and password.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
            <LoadingOverlay isLoading={isLoading} />
            <Link href="/" passHref>
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-10 w-10 sm:h-12 sm:w-12">
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close</span>
                </Button>
            </Link>
             <div className="w-full max-w-sm space-y-6 p-4 sm:rounded-lg sm:border sm:bg-card sm:p-8 sm:shadow-sm">
                <Link href="/" className="flex items-center justify-center gap-2">
                    <Wallet className="w-12 h-12 text-primary" />
                    <span className="text-4xl font-bold text-foreground">BluePay</span>
                </Link>
                <div className="space-y-4">
                    <h1 className="sr-only">Log In</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                         <Input
                            id="email"
                            type="email"
                            placeholder="Email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="h-12 text-base"
                        />
                         <Input 
                            id="password" 
                            type="password"
                            placeholder="Password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading} 
                            className="h-12 text-base"
                        />
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Login Error</AlertTitle>
                                <AlertDescription>
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="text-sm">
                            <Link href="#" className="font-medium text-primary hover:text-primary/90">
                                Forgot password?
                            </Link>
                        </div>
                        <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isLoading}>
                           Log In
                        </Button>
                    </form>
                </div>
                <SeparatorWithText />
                <Button variant="outline" className="w-full h-12 text-lg font-bold" onClick={() => router.push('/signup')} disabled={isLoading}>
                    Sign Up
                </Button>
            </div>
        </div>
    );
}
