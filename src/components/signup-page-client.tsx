
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
import { Dictionary } from '@/dictionaries';


export default function SignupPageClient({ dictionary }: { dictionary: Dictionary }) {
    const d = dictionary.signup;
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
                setError(d.selectTypeError);
                return;
            }
        }
        
        if (step === 2) { 
            if (!email) {
                setError(d.emailRequiredError);
                return;
            }
            setIsLoading(true);
            try {
                const emailExists = await checkEmailExists(email);
                if (emailExists) {
                    setError(d.emailExistsError);
                    setIsLoading(false);
                    return;
                }
            } catch (err) {
                 setError(d.emailValidateError);
                 setIsLoading(false);
                 return;
            } finally {
                setIsLoading(false);
            }
        }
        
        if (step === 3) { 
            if (password.length < 6) {
                setError(d.passwordLengthError);
                return;
            }
            if (password !== confirmPassword) {
                setError(d.passwordMismatchError);
                return;
            }
        }
        
        if (step === 4) { 
            if (!firstName || !lastName) {
                setError(d.nameRequiredError);
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
                setError(d.termsRequiredError);
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
            setError(d.termsRequiredError);
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
                title: d.signupSuccessTitle,
                description: d.signupSuccessDescription,
            });
            router.push('/welcome');
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                 setError(d.emailExistsError);
                 setStep(2); 
            } else if (err.code === 'auth/weak-password') {
                 setError(d.weakPasswordError);
                 setStep(3); 
            } else {
                 setError(err.message || d.genericError);
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
                                    <p className="font-semibold">{d.personalAccount}</p>
                                    <p className="text-sm text-muted-foreground">{d.personalDescription}</p>
                                </div>
                                <RadioGroupItem value="personal" id="personal" />
                            </Label>
                             <Label htmlFor="business" className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-primary has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 transition-colors">
                                <Building className="w-8 h-8 text-primary" />
                                <div className="flex-1">
                                    <p className="font-semibold">{d.businessAccount}</p>
                                    <p className="text-sm text-muted-foreground">{d.businessDescription}</p>
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
                        <h2 className="text-xl font-semibold text-center">{d.emailTitle}</h2>
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
                        <h2 className="text-xl font-semibold text-center">{d.passwordTitle}</h2>
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
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder={d.confirmPasswordPlaceholder}
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
                        <h2 className="text-xl font-semibold text-center">{d.nameTitle}</h2>
                        <Input
                            id="firstName"
                            type="text"
                            placeholder={d.firstNamePlaceholder}
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            disabled={isLoading}
                            className="h-12 text-base"
                        />
                         <Input
                            id="lastName"
                            type="text"
                            placeholder={d.lastNamePlaceholder}
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
                            <h2 className="text-xl font-semibold text-center">{d.businessInfoTitle}</h2>
                            <p className="text-center text-sm text-muted-foreground">{d.businessInfoDescription}</p>
                            <Input
                                id="businessId"
                                type="text"
                                placeholder={d.businessIdPlaceholder}
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
                        <h2 className="text-xl font-semibold text-center">{d.finalStepTitle}</h2>
                         <div className="flex items-start space-x-3 p-4 border rounded-md">
                            <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))} className="mt-1" />
                            <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: d.termsAgreement.replace('<1>', '<a href="/terms" class="font-medium text-primary hover:underline" target="_blank">').replace('</1>', '</a>').replace('<3>', '<a href="/privacy" class="font-medium text-primary hover:underline" target="_blank">').replace('</3>', '</a>') }} />
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
                        <h2 className="text-xl font-semibold text-center">{d.finalStepTitle}</h2>
                        <div className="flex items-start space-x-3 p-4 border rounded-md">
                            <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))} className="mt-1" />
                            <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: d.termsAgreement.replace('<1>', '<a href="/terms" class="font-medium text-primary hover:underline" target="_blank">').replace('</1>', '</a>').replace('<3>', '<a href="/privacy" class="font-medium text-primary hover:underline" target="_blank">').replace('</3>', '</a>') }} />
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

                    </CardHeader>
                    <CardContent className="p-6">
                         <form onSubmit={(e) => { e.preventDefault(); buttonAction(); }} className="space-y-6">
                            <div>
                               {renderStepContent()}
                            </div>
                            
                             <div className="flex gap-4 pt-4">
                                {step > 1 && (
                                     <Button variant="outline" onClick={handlePrevStep} className="w-full h-12" disabled={isLoading} type="button">
                                        {d.backButton}
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
                                    {isFinalStep ? d.createAccountButton : d.continueButton}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                
                 <p className="text-center text-sm text-muted-foreground mt-6">
                    {step > 1 ? (
                         <button onClick={() => { setStep(1); setAccountType(null); setError(''); }} className="font-medium text-primary hover:underline">
                            {d.startOver}
                        </button>
                    ) : (
                        <>
                           {d.alreadyHaveAccount}{' '}
                           <Link href="/login" className="font-medium text-primary hover:underline">
                                {d.logInLink}
                           </Link>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
