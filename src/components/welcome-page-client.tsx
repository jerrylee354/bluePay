
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Upload, Building, Phone } from 'lucide-react';
import { db, updateDoc } from '@/lib/firebase';
import { doc } from 'firebase/firestore';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { Dictionary } from '@/dictionaries';

function WelcomeContent({ dictionary }: { dictionary: Dictionary }) {
    const { user, userData, checkUsernameExists, refreshUserData, isLoading: isAuthLoading } = useAuth();
    const d = dictionary.welcome;
    
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    
    const [username, setUsername] = useState('');
    const [businessPhone, setBusinessPhone] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const { toast } = useToast();
    const isBusiness = userData?.accountType === 'business';

    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/login');
        }
    }, [isAuthLoading, user, router]);

    const getInitials = (email: string | null | undefined) => {
        if (!email) return 'U';
        return email.charAt(0).toUpperCase();
    }
    
    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_.]/g, ''));
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsLoading(true);
            try {
                 const options = {
                    maxSizeMB: 0.2, 
                    maxWidthOrHeight: 256,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(file, options);
                setAvatarFile(compressedFile);
                
                const reader = new FileReader();
                reader.onloadend = () => {
                    setAvatarPreview(reader.result as string);
                };
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                console.error("Image compression error:", error);
                toast({ variant: 'destructive', title: d.imageProcessFailed, description: d.imageProcessError });
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    const finishOnboarding = async () => {
        if (!user) return;
        setIsLoading(true);

        try {
            const updates: { hasCompletedOnboarding: boolean; photoURL?: string, phone?: string } = {
                hasCompletedOnboarding: true,
            };

            if (avatarFile) {
                const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(avatarFile);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = error => reject(error);
                });
                
                updates.photoURL = dataUrl;
            }
            if (isBusiness && businessPhone) {
                updates.phone = businessPhone;
            }
            
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, updates);
            await refreshUserData();
            
            toast({ title: d.setupComplete, description: d.welcomeToBluePay });
            
            setIsFadingOut(true);
            setTimeout(() => router.push('/home'), 500);

        } catch (error: any) {
            toast({ variant: 'destructive', title: d.setupFailed, description: d.genericError });
            console.error("Onboarding Finish Error:", error);
            setIsLoading(false);
        }
    };
    
    const handleNextStep = async () => {
        setError(null);
        if (step === 1) {
            setStep(2);
            return;
        } 
        if (step === 2) {
             if (!username || username.length < 3) {
                setError(d.usernameLengthError);
                return;
            }
            if (!user) {
                toast({ variant: 'destructive', title: d.authError });
                return;
            }

            setIsLoading(true);
            try {
                const isTaken = await checkUsernameExists(`@${username}`);
                if (isTaken) {
                    setError(d.usernameTakenError);
                    setIsLoading(false);
                    return;
                }

                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, { username: `@${username}` });
                await refreshUserData();
                setStep(3);
            } catch (error: any) {
                toast({ variant: 'destructive', title: d.updateFailed, description: d.usernameUpdateError });
                console.error("Username update error:", error);
            } finally {
                setIsLoading(false);
            }
        }
        if (step === 3 && isBusiness) {
            if (!businessPhone) {
                setError(d.phoneRequiredError);
                return;
            }
            await finishOnboarding();
            return;
        }
    };

    if (isAuthLoading || !user) {
        return <LoadingOverlay isLoading={true} />;
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="text-center space-y-6 animate-fade-in p-4 sm:p-6">
                        <div className="flex justify-center">
                            <div className="p-4 bg-primary/10 rounded-full animate-reveal">
                                <Wallet className="w-16 h-16 text-primary" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">{d.title}</h1>
                            <p className="text-muted-foreground text-lg">{d.subtitle}</p>
                        </div>
                        <Button onClick={handleNextStep} className="w-full max-w-xs h-12 text-lg font-semibold">
                            {d.getStarted}
                        </Button>
                    </div>
                );
            case 2:
                return (
                    <div className="text-center space-y-6 animate-fade-in p-4 sm:p-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">{d.createUsernameTitle}</h1>
                            <p className="text-muted-foreground text-lg">{d.createUsernameSubtitle}</p>
                        </div>
                        <div className="px-4">
                            <div className="flex h-12 items-center rounded-md border border-input px-3 has-[:focus]:ring-2 has-[:focus]:ring-ring">
                                <span className="text-muted-foreground">@</span>
                                <Input 
                                    value={username}
                                    onChange={handleUsernameChange}
                                    placeholder="username"
                                    className="h-auto flex-1 border-0 bg-transparent p-0 pl-1 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>
                            {error && (
                                <div className="flex items-center justify-center gap-2 text-sm text-destructive pt-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                        <Button onClick={handleNextStep} disabled={isLoading || !username || username.length < 3} className="w-full max-w-xs h-12 text-lg font-semibold">
                            {d.saveAndContinue}
                        </Button>
                    </div>
                );
            case 3:
                if (isBusiness) {
                    return (
                        <div className="text-center space-y-6 animate-fade-in p-4 sm:p-6">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tight">{d.businessInfoTitle}</h1>
                                <p className="text-muted-foreground text-lg">{d.businessInfoSubtitle}</p>
                            </div>
                            <div className="px-4 space-y-4">
                                <label htmlFor="avatar-upload" className="cursor-pointer group relative w-40 h-40 mx-auto block">
                                    <div className="w-full h-full border-4 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Logo Preview" className="w-full h-full object-contain rounded-md" />
                                        ) : (
                                            <>
                                                <Building className="h-12 w-12 mb-2" />
                                                <span className="font-semibold">{d.uploadLogo}</span>
                                            </>
                                        )}
                                    </div>
                                </label>
                                <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                 <div className="flex h-12 items-center rounded-md border border-input px-3 has-[:focus]:ring-2 has-[:focus]:ring-ring">
                                    <Phone className="text-muted-foreground mr-2" />
                                    <Input 
                                        value={businessPhone}
                                        onChange={(e) => setBusinessPhone(e.target.value)}
                                        placeholder={d.businessPhonePlaceholder}
                                        type="tel"
                                        className="h-auto flex-1 border-0 bg-transparent p-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                </div>
                                {error && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-destructive pt-1">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>
                             <Button onClick={handleNextStep} disabled={isLoading || !businessPhone} className="w-full max-w-xs h-12 text-lg font-semibold">
                                {d.finishSetup}
                            </Button>
                        </div>
                    )
                }
                // Personal account profile setup
                return (
                    <div className="text-center space-y-6 animate-fade-in p-4 sm:p-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">{d.setupProfileTitle}</h1>
                            <p className="text-muted-foreground text-lg">{d.setupProfileSubtitle}</p>
                        </div>

                        <div className="flex justify-center">
                            <label htmlFor="avatar-upload" className="cursor-pointer group relative">
                                <Avatar className="h-40 w-40 border-4 border-muted group-hover:border-primary transition-colors">
                                    <AvatarImage src={avatarPreview || ""} alt="Avatar Preview" />
                                    <AvatarFallback className="text-5xl">
                                        {getInitials(user?.email)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                                    <Upload className="h-10 w-10 mb-2" />
                                    <span className="font-semibold">{d.changeAvatar}</span>
                                </div>
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <Button onClick={finishOnboarding} disabled={isLoading} className="w-full max-w-xs h-12 text-lg font-semibold">
                                {avatarFile ? d.saveAndFinish : d.finishSetup}
                            </Button>
                            <Button variant="link" onClick={finishOnboarding} disabled={isLoading} className="text-muted-foreground">
                                {d.skipForNow}
                            </Button>
                        </div>
                    </div>
                );
            }
    };

    return (
        <>
            <style jsx>{`
                .animate-reveal {
                    animation: reveal 1s ease-out forwards;
                }
                .animate-fade-in {
                    animation: fadeIn 0.6s ease-in-out forwards;
                }
                .animate-fade-out {
                    animation: fadeOut 0.5s ease-in-out forwards;
                }
                @keyframes reveal {
                    from { opacity: 0; filter: blur(5px); transform: scale(0.9); }
                    to { opacity: 1; filter: blur(0); transform: scale(1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeOut {
                    from { opacity: 1; transform: scale(0.95); }
                    to { opacity: 0; transform: scale(0.95); }
                }
            `}</style>
            <LoadingOverlay isLoading={isLoading} />
            <div className={cn("flex min-h-screen flex-col items-center justify-center p-4 transition-all duration-500", isFadingOut ? "animate-fade-out" : "bg-secondary")}>
                <Card className="w-full max-w-md">
                   <CardContent className="p-0">
                       {renderStep()}
                   </CardContent>
                </Card>
            </div>
        </>
    );
}

export default function WelcomePageClientWrapper() {
    const { getDictionary } = useAuthWelcome();
    const [dictionary, setDictionary] = useState<Dictionary | null>(null);

    useEffect(() => {
        const fetchDict = async () => {
            const dict = await getDictionary();
            setDictionary(dict);
        };
        fetchDict();
    }, [getDictionary]);

    if (!dictionary) {
        return <LoadingOverlay isLoading={true} />;
    }

    return <WelcomeContent dictionary={dictionary} />;
}

// A helper hook to get dictionary on the client side for this specific page
import { usePathname } from "next/navigation";
import { i18n, type Locale } from "@/i18n";
import { getDictionary as getDictionaryAsync } from "@/dictionaries";
import { useCallback } from "react";

const useAuthWelcome = () => {
  const pathname = usePathname();

  const getCurrentLocale = useCallback((): Locale => {
    const localeFromPath = pathname.split('/')[1] as Locale;
    return i18n.locales.includes(localeFromPath) ? localeFromPath : i18n.defaultLocale;
  }, [pathname]);
  
  const getDictionary = useCallback(async () => {
      const locale = getCurrentLocale();
      return await getDictionaryAsync(locale);
  }, [getCurrentLocale]);

  return { getDictionary };
};
