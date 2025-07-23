
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { DocumentData } from 'firebase/firestore';
import { ChevronLeft, Delete, X, Image as ImageIcon, FileText, PlusCircle, Trash2 } from 'lucide-react';
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
import { Dictionary } from '@/dictionaries';

export interface OrderItem {
  id: string;
  name: string;
  price: string;
}

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
    const d_confirm = dictionary.paymentConfirm;

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

    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    
    const userId = userIdFromProps || null;
    const mode = modeFromProps || 'pay';
    const isBusinessRequest = userData?.accountType === 'business' && mode === 'request';

    useEffect(() => {
        const total = orderItems.reduce((sum, item) => sum + parseFloat(item.price || '0'), 0);
        if (total > 0) {
            setAmount(total.toFixed(2));
        }
    }, [orderItems]);

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
        if (isProcessing || isBusinessRequest) return;

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
    }, [isProcessing, isBusinessRequest]);

    const handleDelete = useCallback(() => {
        if (isProcessing || isBusinessRequest) return;
        setAmount(prev => {
            const newAmount = prev.slice(0, -1);
            return newAmount === '' ? '0' : newAmount;
        });
    }, [isProcessing, isBusinessRequest]);

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
    
    const formattedAmount = useMemo(() => {
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
    }, [amount]);


    const handlePayment = async () => {
        const numericAmount = parseFloat(amount);
        if (!user || !userData || !recipient || numericAmount <= 0) {
            toast({
                variant: 'destructive',
                title: d_confirm.invalidTransaction,
                description: d_confirm.invalidTransactionDescription,
            });
            return;
        }
        
        setIsProcessing(true);
        try {
            const transactionPayload = {
                fromUserId: user.uid,
                toUserId: recipient.uid,
                amount: numericAmount,
                note,
                attachmentUrl: attachedImage,
                locale: dictionary.locale as 'en' | 'zh-TW',
                orderItems: isBusinessRequest ? orderItems.filter(item => item.name && item.price) : undefined,
            };

            if (mode === 'pay') {
                if (numericAmount > userData.balance) {
                    toast({
                        variant: 'destructive',
                        title: d_confirm.insufficientFunds,
                        description: d_confirm.insufficientFundsDescription.replace('{balance}', formatCurrency(userData.balance, userData.currency)).replace('{amount}', formatCurrency(numericAmount, userData.currency)),
                    });
                    setIsProcessing(false);
                    return;
                }
                await processTransaction(transactionPayload);
            } else { // Request logic
                 await requestTransaction(transactionPayload);
            }

            const mockTransaction: Transaction = {
                id: 'temp-' + Date.now(),
                type: mode === 'pay' ? 'payment' : 'receipt',
                status: mode === 'pay' ? 'Completed' : 'Requested',
                date: new Date().toISOString(),
                amount: numericAmount,
                description: note,
                attachmentUrl: attachedImage,
                name: `${recipient.firstName} ${recipient.lastName}`,
                otherPartyUid: recipient.uid,
                otherParty: recipient,
                orderItems: isBusinessRequest ? orderItems : undefined,
            };

            setCompletedTransaction(mockTransaction);
            setIsPaymentSuccessful(true);

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: d_confirm.transactionFailed,
                description: error.message || d_confirm.genericError,
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
    
    // Business Request Order Item Management
    const addOrderItem = () => {
        setOrderItems(prev => [...prev, { id: Date.now().toString(), name: '', price: '' }]);
    };
    
    const updateOrderItem = (id: string, field: 'name' | 'price', value: string) => {
        setOrderItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const removeOrderItem = (id: string) => {
        setOrderItems(prev => prev.filter(item => item.id !== id));
    };

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
    
    const noteSheetTitle = isBusinessRequest ? d_confirm.editOrder : d_confirm.addNote;
    const noteSheetButtonText = isBusinessRequest ? d_confirm.editOrder : d_confirm.addNote;

    const renderNoteSheetContent = () => {
        if (isBusinessRequest) {
            return (
                 <div className="flex flex-col h-full">
                    <SheetHeader className="p-4 border-b text-left">
                        <SheetTitle className="flex justify-between items-center">
                            <span>{noteSheetTitle}</span>
                            <Button onClick={() => setIsNoteSheetOpen(false)}>{d_confirm.done}</Button>
                        </SheetTitle>
                    </SheetHeader>
                    <div className="p-4 flex-1 overflow-y-auto space-y-4">
                        {orderItems.map((item, index) => (
                             <div key={item.id} className="flex items-center gap-2">
                                <Input
                                    placeholder={`${d_confirm.itemName} ${index + 1}`}
                                    value={item.name}
                                    onChange={e => updateOrderItem(item.id, 'name', e.target.value)}
                                    className="h-11"
                                />
                                <div className="relative">
                                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currencySymbol}</span>
                                     <Input
                                        type="number"
                                        placeholder={d_confirm.price}
                                        value={item.price}
                                        onChange={e => updateOrderItem(item.id, 'price', e.target.value)}
                                        className="h-11 pl-7 w-28"
                                    />
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => removeOrderItem(item.id)}>
                                    <Trash2 className="h-5 w-5 text-destructive" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" onClick={addOrderItem} className="w-full">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            {d_confirm.addItem}
                        </Button>
                        <Textarea 
                            placeholder={d_confirm.addNotePlaceholder}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            className="h-24 text-base resize-none"
                         />
                    </div>
                </div>
            )
        }
        
        // Default note sheet for personal accounts or payments
        return (
             <div className="flex flex-col h-full">
                <SheetHeader className="p-4 border-b text-left">
                    <SheetTitle className="flex justify-between items-center">
                        <span>{noteSheetTitle}</span>
                        <Button onClick={() => setIsNoteSheetOpen(false)}>{d_confirm.done}</Button>
                    </SheetTitle>
                </SheetHeader>
                <div className="p-4 flex-1 space-y-4">
                     <Textarea 
                        placeholder={d_confirm.addNotePlaceholder}
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
                        {d_confirm.uploadImage}
                    </Button>
                </div>
            </div>
        );
    }
    
    return (
      <div className={cn("bg-background", isMobile ? "flex flex-col h-dvh" : "flex flex-row h-[580px] rounded-xl overflow-hidden")}>
          <LoadingOverlay isLoading={isProcessing || isLoading} />
          <div className="flex-1 flex flex-col md:border-r">
              {isMobile && (
                  <header className="relative flex items-center justify-between p-4 flex-shrink-0">
                      <Button variant="ghost" size="icon" onClick={handleBack}>
                          <ChevronLeft className="h-6 w-6" />
                          <span className="sr-only">Back</span>
                      </Button>
                      <h1 className="text-xl font-semibold">{mode === 'pay' ? d_confirm.payTitle : d_confirm.requestTitle}</h1>
                      <div className="w-10"></div>
                  </header>
              )}
              <div className="flex-1 flex flex-col justify-between p-4 md:p-6 text-center">
                <div className="space-y-4">
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
                            <span className={cn("text-5xl md:text-6xl font-light tracking-tighter", isBusinessRequest && 'text-muted-foreground')} style={{ minWidth: '1ch' }}>
                                {formattedAmount}
                                {!isBusinessRequest && <span className="animate-pulse">|</span>}
                            </span>
                        </div>
                    </div>
                </div>

                 <div className="flex-shrink-0 space-y-4">
                     <Sheet open={isNoteSheetOpen} onOpenChange={setIsNoteSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="h-12 md:h-14 rounded-full text-base w-full bg-muted/50">
                                {note || imagePreview || orderItems.length > 0 ? (
                                    <p className="truncate">
                                        {isBusinessRequest ? (note || `${orderItems.length} ${d_confirm.items}`) : (note || d_confirm.imageAttached) }
                                    </p>
                                ) : (
                                    <><FileText className="mr-2 h-5 w-5" />{noteSheetButtonText}</>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-2xl p-0" hideCloseButton={true}>
                             {renderNoteSheetContent()}
                        </SheetContent>
                    </Sheet>
                     <Button 
                        className="h-12 md:h-14 rounded-full text-lg font-bold w-full"
                        onClick={handlePayment}
                        disabled={isProcessing || isLoading || !recipient || parseFloat(amount) <= 0}
                    >
                        {mode === 'pay' ? d.pay : d.request}
                    </Button>
                </div>
            </div>
          </div>
          <div className={cn("flex-shrink-0", isMobile ? "block" : "w-80", isBusinessRequest && "opacity-50 pointer-events-none")}>
              <Keypad onKeyClick={handleKeypadClick} onDelete={handleDelete} />
          </div>
      </div>
    );
}

