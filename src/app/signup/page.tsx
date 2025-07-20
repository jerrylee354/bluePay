
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet, User, Building, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LoadingOverlay } from '@/components/ui/loading-overlay';


export default function SignupPage() {
    const [step, setStep] = useState(1);
    const [accountType, setAccountType] = useState<'personal' | 'business' | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [businessId, setBusinessId] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const router = useRouter();
    const { signup, checkEmailExists } = useAuth();
    const { toast } = useToast();

    const totalSteps = accountType === 'business' ? 5 : 4;
    const progress = step > 1 ? ((step - 1) / totalSteps) * 100 : 0;

    const handleNextStep = async () => {
        setError('');
        
        if (step === 1) {
            if (!accountType) {
                setError('Please select an account type to continue.');
                return;
            }
        }
        
        if (step === 2) { 
            if (!email) {
                setError('Please enter your email address.');
                return;
            }
             if (accountType === 'business') {
                const domain = email.split('@')[1];
                if (!domain || ['gmail.com', 'yahoo.com', 'hotmail.com'].includes(domain)) {
                    setError('Business accounts require a company domain email.');
                    return;
                }
            }
            setIsLoading(true);
            try {
                const emailExists = await checkEmailExists(email);
                if (emailExists) {
                    setError('This email address is already in use.');
                    setIsLoading(false);
                    return;
                }
            } catch (err) {
                 setError('Failed to validate email. Please try again.');
                 setIsLoading(false);
                 return;
            } finally {
                setIsLoading(false);
            }
        }
        
        if (step === 3) { 
            if (password.length < 6) {
                setError('Password must be at least 6 characters long.');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
        }
        
        if (step === 4) { 
            if (!firstName || !lastName) {
                setError('Please enter your first and last name.');
                return;
            }
        }

        const isFinalStep = (accountType === 'personal' && step === 4) || (accountType === 'business' && step === 5);
        if (isFinalStep) {
            setStep(prev => prev + 1);
            return;
        }

        const isSubmitStep = (accountType === 'personal' && step === 5) || (accountType === 'business' && step === 6);
        if (isSubmitStep) {
            if (!agreedToTerms) {
                setError('You must agree to the terms to continue.');
                return;
            }
            handleSubmit();
            return;
        }
        
        setStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
        setError('');
        if (step > 1) {
            setStep(prev => prev - 1);
        }
    };
    
    const handleSubmit = async () => {
        if (!agreedToTerms) {
            setError('You must agree to the terms to continue.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const additionalData: Record<string, any> = { 
                accountType,
                firstName,
                lastName
            };
            if (accountType === 'business' && businessId) {
                additionalData.businessId = businessId;
            }

            await signup(email, password, additionalData);
            toast({
                title: "Signup Successful",
                description: "Your account has been created.",
            });
            router.push('/welcome');
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                 setError('This email address is already in use.');
                 setStep(2); 
            } else if (err.code === 'auth/weak-password') {
                 setError('Password is too weak. Please use at least 6 characters.');
                 setStep(3); 
            } else {
                 setError(err.message || "An unexpected error occurred.");
                 setStep(1);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                     <div className="space-y-6">
                        <RadioGroup value={accountType || ""} onValueChange={(value) => setAccountType(value as 'personal' | 'business')} className="space-y-4">
                            <Label htmlFor="personal" className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-primary has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 transition-colors">
                                <User className="w-8 h-8 text-primary" />
                                <div className="flex-1">
                                    <p className="font-semibold">Personal</p>
                                    <p className="text-sm text-muted-foreground">For individuals to send & receive money.</p>
                                </div>
                                <RadioGroupItem value="personal" id="personal" />
                            </Label>
                             <Label htmlFor="business" className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-primary has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 transition-colors">
                                <Building className="w-8 h-8 text-primary" />
                                <div className="flex-1">
                                    <p className="font-semibold">Business</p>
                                    <p className="text-sm text-muted-foreground">For companies to manage payments.</p>
                                </div>
                                <RadioGroupItem value="business" id="business" />
                            </Label>
                        </RadioGroup>
                         {error && (
                            <div className="flex items-center justify-center gap-2 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-center">What's your email?</h2>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email address"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="h-12 text-base"
                        />
                        {error && (
                            <div className="flex items-center justify-center gap-2 text-sm text-destructive pt-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-center">Create a password</h2>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Password (min. 6 characters)"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="h-12 text-base"
                        />
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            className="h-12 text-base"
                        />
                        {error && (
                             <div className="flex items-center justify-center gap-2 text-sm text-destructive pt-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-center">What's your name?</h2>
                        <Input
                            id="firstName"
                            type="text"
                            placeholder="First Name"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            disabled={isLoading}
                            className="h-12 text-base"
                        />
                         <Input
                            id="lastName"
                            type="text"
                            placeholder="Last Name"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            disabled={isLoading}
                            className="h-12 text-base"
                        />
                        {error && (
                             <div className="flex items-center justify-center gap-2 text-sm text-destructive pt-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                );
            case 5:
                if (accountType === 'business') {
                     return (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-center">Business Information</h2>
                            <p className="text-center text-sm text-muted-foreground">This helps us verify your business.</p>
                            <Input
                                id="businessId"
                                type="text"
                                placeholder="Business ID / Tax ID (Optional)"
                                value={businessId}
                                onChange={(e) => setBusinessId(e.target.value)}
                                disabled={isLoading}
                                className="h-12 text-base"
                            />
                            {error && (
                                <div className="flex items-center justify-center gap-2 text-sm text-destructive pt-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    );
                }
                return (
                     <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-center">One last step</h2>
                         <div className="flex items-start space-x-3 p-4 border rounded-md">
                            <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))} className="mt-1" />
                            <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                                By creating an account, you agree to BluePay's <Link href="/terms" className="font-medium text-primary hover:underline" target="_blank">Terms of Service</Link> and <Link href="/privacy" className="font-medium text-primary hover:underline" target="_blank">Privacy Policy</Link>.
                            </Label>
                        </div>
                        {error && (
                            <div className="flex items-center justify-center gap-2 text-sm text-destructive pt-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                );
            case 6: 
                 return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-center">Terms & Privacy</h2>
                        <div className="flex items-start space-x-3 p-4 border rounded-md">
                            <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))} className="mt-1" />
                            <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                                By creating an account, you agree to BluePay's <Link href="/terms" className="font-medium text-primary hover:underline" target="_blank">Terms of Service</Link> and <Link href="/privacy" className="font-medium text-primary hover:underline" target="_blank">Privacy Policy</Link>.
                            </Label>
                        </div>
                        {error && (
                             <div className="flex items-center justify-center gap-2 text-sm text-destructive pt-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    const isFinalStep = (accountType === 'personal' && step === 5) || (accountType === 'business' && step === 6);
    const buttonAction = handleNextStep;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <LoadingOverlay isLoading={isLoading} />
             <div className="w-full max-w-md">
                <Card className="w-full">
                    <CardHeader>
                        {step > 1 && (
                             <div className="space-y-2 pt-2">
                                <Progress value={progress} className="h-2" />
                             </div>
                        )}
                         {step === 1 && (
                            <div className="flex flex-col items-center justify-center gap-2 text-center">
                                <div className="flex items-center gap-2">
                                    <Wallet className="w-12 h-12 text-primary" />
                                    <span className="text-4xl font-bold text-foreground">BluePay</span>
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-bold">Join BluePay</h1>
                                    <p className="text-muted-foreground">Choose your account type to get started.</p>
                                </div>
                            </div>
                         )}
                    </CardHeader>
                    <CardContent className="p-6">
                         <form onSubmit={(e) => { e.preventDefault(); buttonAction(); }} className="space-y-6">
                            <div>
                               {renderStepContent()}
                            </div>
                            
                             <div className="flex gap-4 pt-4">
                                {step > 1 && (
                                     <Button variant="outline" onClick={handlePrevStep} className="w-full h-12" disabled={isLoading} type="button">
                                        Back
                                    </Button>
                                )}
                                <Button 
                                    className="w-full h-12" 
                                    disabled={
                                        isLoading || 
                                        (step === 1 && !accountType) ||
                                        (isFinalStep && !agreedToTerms)
                                    } 
                                    type="submit"
                                >
                                    {isFinalStep ? 'Create Account' : 'Continue'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                
                 <p className="text-center text-sm text-muted-foreground mt-6">
                    {step > 1 ? (
                         <button onClick={() => { setStep(1); setAccountType(null); setError(''); }} className="font-medium text-primary hover:underline">
                            Start Over
                        </button>
                    ) : (
                        <>
                           Already have an account?{' '}
                           <Link href="/login" className="font-medium text-primary hover:underline">
                                Log In
                           </Link>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
