

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { DocumentData } from 'firebase/firestore';
import { ChevronLeft, Delete, X, Image as ImageIcon, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import imageCompression from 'browser-image-compression';
import PaymentSuccess from './payment-success';
import { type Transaction } from '@/lib/data';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Dictionary } from '@/dictionaries';

const RecipientSkeleton = () => (
    <div className="flex items-center space-x-4 p-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
        </div>
    </div>
);

const KeypadButton = ({ value, letters, onClick }: { value: string, letters?: string, onClick: (value: string) => void }) => (
    <Button
        variant="ghost"
        className="text-4xl font-light h-16 md:h-20 w-full rounded-xl focus:bg-muted/80 flex flex-col items-center justify-center gap-0 leading-none"
        onClick={() => onClick(value)}
    >
        <span>{value}</span>
        {letters && <span className="text-xs tracking-widest font-sans">{letters}</span>}
    </Button>
);

interface PaymentConfirmProps {
    isDialog?: boolean;
    onClose?: () => void;
    dictionary: Dictionary;
    userIdFromProps?: string | null;
    modeFromProps?: 'pay' | 'request' | string;
}

const Keypad = ({ onKeyClick, onDelete }: { onKeyClick: (value: string) => void, onDelete: () => void }) => (
    <div className="grid grid-cols-3 gap-1 p-4 bg-muted/20 rounded-b-xl md:bg-transparent md:rounded-b-none md:rounded-r-xl md:h-full">
        <KeypadButton value="1" onClick={onKeyClick} />
        <KeypadButton value="2" letters="ABC" onClick={onKeyClick} />
        <KeypadButton value="3" letters="DEF" onClick={onKeyClick} />
        <KeypadButton value="4" letters="GHI" onClick={onKeyClick} />
        <KeypadButton value="5" letters="JKL" onClick={onKeyClick} />
        <KeypadButton value="6" letters="MNO" onClick={onKeyClick} />
        <KeypadButton value="7" letters="PQRS" onClick={onKeyClick} />
        <KeypadButton value="8" letters="TUV" onClick={onKeyClick} />
        <KeypadButton value="9" letters="WXYZ" onClick={onKeyClick} />
        <KeypadButton value="." onClick={onKeyClick} />
        <KeypadButton value="0" onClick={onKeyClick} />
        <Button variant="ghost" className="h-16 md:h-20" onClick={onDelete}>
            <Delete className="w-8 h-8"/>
        </Button>
    </div>
);


export default function PaymentConfirm({ 
    isDialog = false, 
    onClose, 
    dictionary, 
    userIdFromProps, 
    modeFromProps 
}: PaymentConfirmProps) {
    const router = useRouter();
    
    const { getUserById, processTransaction, requestTransaction, user, userData } = useAuth();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const d = dictionary.pay;

    const [recipient, setRecipient] = useState<DocumentData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [amount, setAmount] = useState('0');
    const [note, setNote] = useState('');
    const [attachedImage, setAttachedImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
    const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
    
    const userId = userIdFromProps || null;
    const mode = modeFromProps || 'pay';

    useEffect(() => {
        if (!userId) {
            setError("No recipient specified.");
            setIsLoading(false);
            return;
        }

        setError(null);
        setIsLoading(true);

        const fetchRecipient = async () => {
            try {
                const recipientData = await getUserById(userId);
                if (recipientData) {
                    setRecipient(recipientData);
                } else {
                    setError("Recipient not found.");
                }
            } catch (err: any) {
                setError("Failed to fetch recipient details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecipient();
    }, [userId, getUserById]);
    
    const handleKeypadClick = useCallback((value: string) => {
        if (isProcessing) return;

        setAmount(prevAmount => {
            if (value === '.') {
                if (!prevAmount.includes('.')) {
                    return prevAmount + '.';
                }
                return prevAmount;
            }
    
            if (prevAmount === '0') {
                return value;
            }
    
            const [integerPart, decimalPart] = prevAmount.split('.');
    
            if (decimalPart && decimalPart.length >= 2) {
                return prevAmount; // Limit to 2 decimal places
            }
    
            if (!prevAmount.includes('.') && integerPart.replace(/,/g, '').length >= 9) {
                return prevAmount; // Limit to 9 integer digits
            }
    
            return prevAmount + value;
        });
    }, [isProcessing]);

    const handleDelete = useCallback(() => {
        if (isProcessing) return;
        setAmount(prev => {
            const newAmount = prev.slice(0, -1);
            return newAmount === '' ? '0' : newAmount;
        });
    }, [isProcessing]);

    const handleImageChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const options = {
                  maxSizeMB: 0.5,
                  maxWidthOrHeight: 800,
                  useWebWorker: true,
                };
    
                const compressedFile = await imageCompression(file, options);
                
                const reader = new FileReader();
                reader.readAsDataURL(compressedFile);
                reader.onload = () => {
                    const dataUrl = reader.result as string;
                    setAttachedImage(dataUrl);
                    setImagePreview(dataUrl);
                };
                reader.onerror = (error) => {
                    toast({ variant: 'destructive', title: "File Read Failed", description: "Could not read the selected file." });
                };
    
            } catch (error: any) {
                 toast({ variant: 'destructive', title: "Image Processing Failed", description: `Could not process image: ${error.message}` });
            }
        }
    }, [toast]);

    const removeImage = useCallback(() => {
        setAttachedImage(null);
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    }, []);


    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.charAt(0).toUpperCase();
    }
    
    const formattedAmount = (() => {
        if (amount === '0' && !amount.includes('.')) return '0';
        const [integerPart, decimalPart] = amount.split('.');
        const formattedIntegerPart = new Intl.NumberFormat('en-US').format(BigInt(integerPart.replace(/,/g, '') || '0'));
        if (decimalPart !== undefined) {
            return `${formattedIntegerPart}.${decimalPart}`;
        }
        if (amount.endsWith('.')) {
            return `${formattedIntegerPart}.`;
        }
        return formattedIntegerPart;
    })();

    const handlePayment = async () => {
        const numericAmount = parseFloat(amount);
        if (!user || !userData || !recipient || numericAmount <= 0) {
            toast({
                variant: 'destructive',
                title: 'Invalid Transaction',
                description: 'Please enter a valid amount and ensure recipient is correct.',
            });
            return;
        }
        
        setIsProcessing(true);
        try {
            if (mode === 'pay') {
                if (numericAmount > userData.balance) {
                    toast({
                        variant: 'destructive',
                        title: 'Insufficient Funds',
                        description: `Your balance is ${formatCurrency(userData.balance, userData.currency)}, but you tried to send ${formatCurrency(numericAmount, userData.currency)}.`,
                    });
                    setIsProcessing(false);
                    return;
                }
                await processTransaction({
                    fromUserId: user.uid,
                    toUserId: recipient.uid,
                    amount: numericAmount,
                    note,
                    attachmentUrl: attachedImage,
                    locale: dictionary.locale as 'en' | 'zh-TW',
                });
            } else { // Request logic
                 await requestTransaction({
                    fromUserId: user.uid,
                    toUserId: recipient.uid,
                    amount: numericAmount,
                    note,
                    attachmentUrl: attachedImage,
                    locale: dictionary.locale as 'en' | 'zh-TW',
                 });
            }

            const mockTransaction: Transaction = {
                id: 'temp-' + Date.now(),
                type: mode === 'pay' ? 'payment' : 'receipt',
                status: mode === 'pay' ? 'Completed' : 'Pending',
                date: new Date().toISOString(),
                amount: numericAmount,
                description: note,
                attachmentUrl: attachedImage,
                name: `${recipient.firstName} ${recipient.lastName}`,
                otherPartyUid: recipient.uid,
                otherParty: recipient,
            };

            setCompletedTransaction(mockTransaction);
            setIsPaymentSuccessful(true);

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Transaction Failed',
                description: error.message || 'An unexpected error occurred.',
            });
            setIsProcessing(false);
        }
    };

    const formatCurrency = (value: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(value);
    }
    
    const currencySymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency: userData?.currency || 'USD' }).formatToParts(1).find(p => p.type === 'currency')?.value || '$';

    const handleBack = () => {
        if (isDialog && onClose) {
            onClose();
        } else {
            router.back();
        }
    }
    
    const handleFinish = () => {
        if (onClose) {
            onClose();
        } else {
            router.push(`/${dictionary.locale}/home`);
        }
    }

    if (isPaymentSuccessful && completedTransaction) {
        return (
            <PaymentSuccess
                transaction={completedTransaction}
                onFinish={handleFinish}
                dictionary={dictionary}
            />
        );
    }

    if (isMobile === undefined) {
        return <LoadingOverlay isLoading={true} />;
    }

    return (
      <div className={cn("bg-background", isMobile ? "flex flex-col h-dvh" : "flex flex-row h-[580px] rounded-xl overflow-hidden")}>
          <LoadingOverlay isLoading={isProcessing} />
          <div className="flex-1 flex flex-col md:border-r">
               {isMobile && (
                  <header className="relative flex items-center justify-between p-4 flex-shrink-0">
                      <Button variant="ghost" size="icon" onClick={handleBack}>
                          <ChevronLeft className="h-6 w-6" />
                          <span className="sr-only">Back</span>
                      </Button>
                      <h1 className="text-xl font-semibold">{mode === 'pay' ? '付款' : '要求付款'}</h1>
                      <div className="w-10"></div>
                  </header>
              )}
               <div className="flex-1 flex flex-col justify-between p-4 md:p-6 text-center">
                  <div className="space-y-4">
                       {isLoading && <RecipientSkeleton />}
                       {error && <p className="text-center text-destructive">{error}</p>}
                       {recipient && (
                           <div className="flex flex-col items-center space-y-2">
                              <Avatar className="h-16 w-16">
                                  <AvatarImage src={recipient.photoURL} alt={recipient.firstName} />
                                  <AvatarFallback className="text-2xl">{getInitials(recipient.firstName)}</AvatarFallback>
                              </Avatar>
                              <div>
                                  <p className="font-semibold text-xl">{recipient.firstName} {recipient.lastName}</p>
                                  <p className="text-muted-foreground">{recipient.username || recipient.email}</p>
                              </div>
                          </div>
                       )}

                       <div className="flex items-center justify-center gap-2 py-4">
                          <div className="flex items-baseline">
                               <span className="text-5xl md:text-6xl font-light text-muted-foreground">{currencySymbol}</span>
                              <span className="text-5xl md:text-6xl font-light tracking-tighter" style={{ minWidth: '1ch' }}>
                                  {formattedAmount}
                                  <span className="animate-pulse">|</span>
                              </span>
                          </div>
                      </div>
                  </div>

                   <div className="flex-shrink-0 space-y-4">
                       <Sheet open={isNoteSheetOpen} onOpenChange={setIsNoteSheetOpen}>
                          <SheetTrigger asChild>
                              <Button variant="outline" className="h-12 md:h-14 rounded-full text-base w-full bg-muted/50">
                                  {!note && !imagePreview && <><FileText className="mr-2 h-5 w-5" />新增附註</>}
                                  {note && !imagePreview && <p className="truncate">{note}</p>}
                                  {imagePreview && (
                                      <div className="flex items-center gap-2 truncate">
                                          <img src={imagePreview} alt="Note attachment" className="h-8 w-8 rounded-md object-cover" />
                                          <p className="truncate">{note || "圖片附件"}</p>
                                      </div>
                                  )}
                              </Button>
                          </SheetTrigger>
                          <SheetContent side="bottom" className="rounded-t-2xl p-0" hideCloseButton={true}>
                               <div className="flex flex-col h-full">
                                  <SheetHeader className="p-4 border-b text-left">
                                      <SheetTitle className="flex justify-between items-center">
                                          <span>新增附註</span>
                                          <Button onClick={() => setIsNoteSheetOpen(false)}>完成</Button>
                                      </SheetTitle>
                                  </SheetHeader>
                                  <div className="p-4 flex-1 space-y-4">
                                       <Textarea 
                                          placeholder="你想說些什麼？"
                                          value={note}
                                          onChange={e => setNote(e.target.value)}
                                          className="h-32 text-base resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                                       />
                                       {imagePreview && (
                                          <div className="relative w-24 h-24">
                                              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                                              <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={removeImage}>
                                                  <X className="h-4 w-4" />
                                              </Button>
                                          </div>
                                       )}
                                  </div>
                                  <div className="p-4 border-t">
                                       <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden" />
                                       <Button variant="outline" onClick={() => imageInputRef.current?.click()}>
                                          <ImageIcon className="mr-2 h-5 w-5" />
                                          上傳圖片
                                      </Button>
                                  </div>
                              </div>
                          </SheetContent>
                      </Sheet>
                       <Button 
                          className="h-12 md:h-14 rounded-full text-lg font-bold w-full"
                          onClick={handlePayment}
                          disabled={isProcessing || isLoading || !recipient || parseFloat(amount) <= 0}
                      >
                          {mode === 'pay' ? '下一步' : '要求付款'}
                      </Button>
                  </div>
              </div>
          </div>
          <div className={cn("flex-shrink-0", isMobile ? "block" : "w-80")}>
              <Keypad onKeyClick={handleKeypadClick} onDelete={handleDelete} />
          </div>
      </div>
    );
}
