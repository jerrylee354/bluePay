

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, onSnapshot, DocumentData, orderBy, where, getDocs, limit, runTransaction, writeBatch, updateDoc, serverTimestamp, addDoc, Timestamp } from 'firebase/firestore';
import type { Transaction, WalletItem, TicketTemplate } from '@/lib/data';
import { sendReceipt, type ReceiptDetails } from '@/ai/flows/send-receipt-flow';
import { getDictionary, type Dictionary } from '@/dictionaries';
import { i18n, type Locale } from '@/i18n';
import { OrderItem } from '@/components/payment-confirm';


interface TransactionParams {
    fromUserId: string;
    toUserId: string;
    amount: number;
    note: string;
    attachmentUrl?: string | null;
    payerTxId?: string;
    locale: Locale;
    orderItems?: OrderItem[];
}

interface DeclineTransactionParams {
    payerTxId: string;
    requesterId: string;
    locale: Locale;
}

interface CancelTransactionParams {
    requesterId: string;
    transactionId: string;
    requesteeId: string;
}

interface PaymentSuccessState {
    isPaymentSuccessful: boolean;
    transaction: Transaction | null;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userData: DocumentData | null;
  transactions: Transaction[];
  walletItems: WalletItem[];
  ticketTemplates: TicketTemplate[];
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<any>;
  logout: (options?: { redirect: boolean }) => Promise<void>;
  signup: (email: string, pass: string, additionalData: Record<string, any>) => Promise<any>;
  updateTheme: (theme: string) => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
  checkUsernameExists: (username: string) => Promise<boolean>;
  searchUsers: (searchTerm: string) => Promise<DocumentData[]>;
  getUserByUsername: (username: string) => Promise<DocumentData | null>;
  getUserById: (userId: string) => Promise<DocumentData | null>;
  processTransaction: (params: TransactionParams) => Promise<Transaction>;
  requestTransaction: (params: TransactionParams) => Promise<Transaction>;
  declineTransaction: (params: DeclineTransactionParams) => Promise<void>;
  cancelTransaction: (params: CancelTransactionParams) => Promise<void>;
  submitAppeal: (userId: string) => Promise<void>;
  isLoading: boolean;
  isLoggingOut: boolean;
  refreshUserData: () => Promise<void>;
  addTicketToWallet: (linkId: string) => Promise<void>;
  useTicket: (ticketId: string, userId: string) => Promise<void>;
  createTicketTemplate: (template: Omit<TicketTemplate, 'id' | 'issuerId' | 'issuerName' | 'createdAt' | 'issuanceCount'>) => Promise<void>;
  updateTicketTemplate: (templateId: string, data: Partial<Omit<TicketTemplate, 'id' | 'issuerId' | 'issuerName' | 'createdAt' | 'issuanceCount'>>) => Promise<void>;
  createTicketLink: (templateId: string) => Promise<string>;
  paymentSuccessState: PaymentSuccessState;
  setPaymentSuccessState: (state: PaymentSuccessState) => void;
  clearPaymentSuccessState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setCookie = (name: string, value: string, days: number) => {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

const eraseCookie = (name: string) => {   
    document.cookie = name+'=; Max-Age=-99999999; path=/;';  
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletItems, setWalletItems] = useState<WalletItem[]>([]);
  const [ticketTemplates, setTicketTemplates] = useState<TicketTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [paymentSuccessState, setPaymentSuccessState] = useState<PaymentSuccessState>({ isPaymentSuccessful: false, transaction: null });

  const router = useRouter();
  const pathname = usePathname();

  const getCurrentLocale = (): Locale => {
    const localeFromPath = pathname.split('/')[1] as Locale;
    return i18n.locales.includes(localeFromPath) ? localeFromPath : i18n.defaultLocale;
  }

  const clearPaymentSuccessState = () => {
    setPaymentSuccessState({ isPaymentSuccessful: false, transaction: null });
    const locale = getCurrentLocale();
    router.push(`/${locale}/home`);
  };

  const refreshUserData = useCallback(async () => {
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const currentData = docSnap.data();
        setUserData(currentData);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      setUser(user);

      if (user) {
        const token = await user.getIdToken();
        setCookie('firebaseIdToken', token, 1);

        const userDocRef = doc(db, "users", user.uid);

        const unsubUser = onSnapshot(userDocRef, async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const currentData = docSnapshot.data();
            
            setUserData(currentData);
            
            if (currentData.accountType === 'business') {
                const templatesColRef = collection(db, "users", user.uid, "ticketTemplates");
                const templatesQuery = query(templatesColRef, orderBy("createdAt", "desc"));
                onSnapshot(templatesQuery, (snapshot) => {
                    const newTemplates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TicketTemplate));
                    setTicketTemplates(newTemplates);
                });
            }
          } else {
            setUserData(null);
          }
          setIsLoading(false);
        });

        const transactionsColRef = collection(db, "users", user.uid, "transactions");
        const transactionsQuery = query(transactionsColRef, orderBy("date", "desc"));
        const unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
          const newTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
          setTransactions(newTransactions);
        });

        const walletColRef = collection(db, "users", user.uid, "walletItems");
        const unsubWallet = onSnapshot(walletColRef, (snapshot) => {
          const newWalletItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WalletItem));
          setWalletItems(newWalletItems);
        });


        return () => {
          unsubUser();
          unsubTransactions();
          unsubWallet();
        };

      } else {
        eraseCookie('firebaseIdToken');
        setUserData(null);
        setTransactions([]);
        setWalletItems([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string, additionalData: Record<string, any>) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    
    const newUserData = {
      uid: user.uid,
      email: user.email,
      ...additionalData,
      balance: 0,
      currency: 'USD',
      theme: 'light',
      hasCompletedOnboarding: false,
      profileStatus: true,
      status: 'Yes',
      hasAppealed: false,
      verify: 'No',
      createdAt: new Date(),
    };

    await setDoc(doc(db, "users", user.uid), newUserData);
    
    setUserData(newUserData);

    return userCredential;
  };

  const logout = async (options: { redirect?: boolean } = { redirect: true }) => {
    setIsLoggingOut(true);
    await signOut(auth);
    eraseCookie('firebaseIdToken');
    const locale = getCurrentLocale();
    if (options.redirect) {
        router.push(`/${locale}/login`);
    }
    setIsLoggingOut(false);
};
  
  const updateTheme = async (theme: string) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, { theme });
  };
  
  const checkEmailExists = async (email: string) => {
    try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        return methods.length > 0;
    } catch (error) {
        console.error("Error checking email existence:", error);
        return false; 
    }
  };

  const checkUsernameExists = async (username: string) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username), limit(1));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const getUserByUsername = async (username: string) => {
    if (!username) return null;
    const usersRef = collection(db, 'users');
    
    const normalizedUsername = username.startsWith('@') ? username : `@${username}`;

    const q = query(usersRef, where('username', '==', normalizedUsername), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
    }
    return null;
  };

  const getUserById = async (userId: string) => {
      if (!userId) return null;
      const userDocRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userDocRef);
      return docSnap.exists() ? docSnap.data() : null;
  };

  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm) return [];

    const usersRef = collection(db, 'users');
    let term = searchTerm.toLowerCase();
    
    const isUsernameSearch = term.startsWith('@');
    
    const processSnapshot = (snapshot: any, usersMap: Map<string, DocumentData>) => {
        snapshot.forEach((doc: any) => {
            const data = doc.data();
            if (data.profileStatus === true) {
                usersMap.set(doc.id, data);
            }
        });
    }

    if (isUsernameSearch) {
        const usernameQuery = query(usersRef, where('username', '>=', term), where('username', '<=', `${term}\uf8ff`), limit(5));
        const usernameSnapshot = await getDocs(usernameQuery);
        const usersMap = new Map<string, DocumentData>();
        processSnapshot(usernameSnapshot, usersMap);
        return Array.from(usersMap.values());
    }

    const emailQuery = query(usersRef, where('email', '>=', term), where('email', '<=', `${term}\uf8ff`), limit(5));
    
    const firstNameTerm = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
    const firstNameQuery = query(usersRef, where('firstName', '>=', firstNameTerm), where('firstName', '<=', `${firstNameTerm}\uf8ff`), limit(5));
    const lastNameQuery = query(usersRef, where('lastName', '>=', firstNameTerm), where('lastName', '<=', `${firstNameTerm}\uf8ff`), limit(5));
    
    try {
        const [emailSnapshot, firstNameSnapshot, lastNameSnapshot] = await Promise.all([
            getDocs(emailQuery),
            getDocs(firstNameQuery),
            getDocs(lastNameSnapshot)
        ]);
        
        const usersMap = new Map<string, DocumentData>();
        
        processSnapshot(emailSnapshot, usersMap);
        processSnapshot(firstNameSnapshot, usersMap);
        processSnapshot(lastNameSnapshot, usersMap);

        return Array.from(usersMap.values());
    } catch (error) {
        console.error("Error searching users: ", error);
        return [];
    }
  };

  const processTransaction = async ({ fromUserId, toUserId, amount, note, attachmentUrl, payerTxId, locale, orderItems }: TransactionParams): Promise<Transaction> => {
    const fromUserRef = doc(db, "users", fromUserId);
    const toUserRef = doc(db, "users", toUserId);
    const dictionary = await getDictionary(locale);
    let createdTransaction: Transaction | null = null;

    try {
        let requesterDocRef: any = null;
        if (payerTxId) {
            const tempPayerTxRef = doc(db, "users", fromUserId, "transactions", payerTxId);
            const tempPayerTxDoc = await getDoc(tempPayerTxRef);
            if (!tempPayerTxDoc.exists() || !tempPayerTxDoc.data()?.requestId) {
                throw new Error("Could not find the request details to process the payment.");
            }
            const sharedRequestId = tempPayerTxDoc.data().requestId;
            const requesterTxQuery = query(collection(db, "users", toUserId, "transactions"), where("requestId", "==", sharedRequestId), limit(1));
            const requesterQuerySnapshot = await getDocs(requesterTxQuery);
            if (requesterQuerySnapshot.empty) {
                throw new Error(`Could not find the corresponding request document for the recipient.`);
            }
            requesterDocRef = requesterQuerySnapshot.docs[0].ref;
        }

        await runTransaction(db, async (transaction) => {
            const fromUserDoc = await transaction.get(fromUserRef);
            const toUserDoc = await transaction.get(toUserRef);

            if (!fromUserDoc.exists() || !toUserDoc.exists()) {
                throw new Error("User not found.");
            }
            
            const fromUserData = fromUserDoc.data();
            const toUserData = toUserDoc.data();
            if (fromUserData.balance < amount) {
                throw new Error("Insufficient funds.");
            }

            const now = new Date();
            const timestamp = now.toISOString();

            const newFromBalance = fromUserData.balance - amount;
            const newToBalance = toUserData.balance + amount;

            transaction.update(fromUserRef, { balance: newFromBalance });
            transaction.update(toUserRef, { balance: newToBalance });

            if (payerTxId && requesterDocRef) {
                const payerTxRef = doc(db, "users", fromUserId, "transactions", payerTxId);
                transaction.update(payerTxRef, { status: dictionary.status.Completed, date: timestamp });
                transaction.update(requesterDocRef, { status: dictionary.status.Completed, date: timestamp });
                const payerTxSnapshot = await transaction.get(payerTxRef);
                createdTransaction = { id: payerTxSnapshot.id, ...payerTxSnapshot.data() } as Transaction;

            } else { 
                const sharedRequestId = doc(collection(db, "dummy")).id;
                const senderTransactionRef = doc(collection(db, "users", fromUserId, "transactions"));
                
                const senderTxData = {
                    amount: amount,
                    description: note,
                    date: timestamp,
                    status: dictionary.status.Completed,
                    attachmentUrl: attachmentUrl || null,
                    requestId: sharedRequestId,
                    orderItems: orderItems || null,
                    type: 'payment',
                    name: `${toUserData.firstName} ${toUserData.lastName}`,
                    currency: fromUserData.currency,
                    otherPartyUid: toUserId,
                };
                transaction.set(senderTransactionRef, senderTxData);
                createdTransaction = { id: senderTransactionRef.id, ...senderTxData, otherParty: toUserData } as Transaction;

                const receiverTransactionRef = doc(collection(db, "users", toUserId, "transactions"));
                transaction.set(receiverTransactionRef, {
                    amount,
                    description: note,
                    date: timestamp,
                    status: dictionary.status.Completed,
                    attachmentUrl: attachmentUrl || null,
                    requestId: sharedRequestId,
                    orderItems: orderItems || null,
                    type: 'receipt',
                    name: `${fromUserData.firstName} ${fromUserData.lastName}`,
                    currency: toUserData.currency,
                    otherPartyUid: fromUserId,
                });
            }
        });

        if (!createdTransaction) throw new Error("Transaction could not be created.");
        return createdTransaction;

    } catch (e) {
        console.error("Transaction failed: ", e);
        if (e instanceof Error) {
            throw e;
        }
        throw new Error("An unknown error occurred during the transaction.");
    }
  };
  
  const requestTransaction = async ({ fromUserId, toUserId, amount, note, attachmentUrl, locale, orderItems }: TransactionParams): Promise<Transaction> => {
    const fromUserRef = doc(db, "users", fromUserId);
    const toUserRef = doc(db, "users", toUserId);
    const dictionary = await getDictionary(locale);

    const fromUserDoc = await getDoc(fromUserRef);
    const toUserDoc = await getDoc(toUserRef);
    
    if (!fromUserDoc.exists() || !toUserDoc.exists()) {
        throw new Error("User not found.");
    }
    
    const fromUserData = fromUserDoc.data();
    const toUserData = toUserDoc.data();

    const now = new Date();
    const timestamp = now.toISOString();
    const sharedRequestId = doc(collection(db, "dummy")).id;
    
    const batch = writeBatch(db);

    const requesterTxRef = doc(collection(db, "users", fromUserId, "transactions"));
    const requesterTxData = {
        amount: amount,
        description: note,
        date: timestamp,
        attachmentUrl: attachmentUrl || null,
        requestId: sharedRequestId,
        orderItems: orderItems || null,
        status: dictionary.status.Pending,
        type: 'receipt',
        name: `${toUserData.firstName} ${toUserData.lastName}`,
        currency: fromUserData.currency,
        otherPartyUid: toUserId,
    };
    batch.set(requesterTxRef, requesterTxData);
    
    const requesteeTxRef = doc(collection(db, "users", toUserId, "transactions"));
    batch.set(requesteeTxRef, {
        amount: amount,
        description: note,
        date: timestamp,
        attachmentUrl: attachmentUrl || null,
        requestId: sharedRequestId,
        orderItems: orderItems || null,
        status: dictionary.status.Requested,
        type: 'payment',
        name: `${fromUserData.firstName} ${fromUserData.lastName}`,
        currency: toUserData.currency,
        otherPartyUid: fromUserId,
    });
    
    await batch.commit();

    return { id: requesterTxRef.id, ...requesterTxData, otherParty: toUserData } as Transaction;
  };

  const declineTransaction = async ({ payerTxId, requesterId, locale }: DeclineTransactionParams) => {
    if (!user) throw new Error("User not authenticated");
    const payerId = user.uid;
    const dictionary = await getDictionary(locale);

    const payerTxRef = doc(db, "users", payerId, "transactions", payerTxId);
    
    const payerTxDoc = await getDoc(payerTxRef);
    if (!payerTxDoc.exists()) {
        throw new Error("Payment request not found.");
    }
    const requestId = payerTxDoc.data().requestId;

    const batch = writeBatch(db);
    batch.delete(payerTxRef);

    if (requestId) {
        const requesterTxQuery = query(
            collection(db, "users", requesterId, "transactions"),
            where("requestId", "==", requestId),
            limit(1)
        );
        const requesterTxSnapshot = await getDocs(requesterTxQuery);
        if (!requesterTxSnapshot.empty) {
            const requesterTxDoc = requesterTxSnapshot.docs[0];
            batch.update(requesterTxDoc.ref, { status: dictionary.status.Failed });
        }
    }
    
    await batch.commit();
  };

  const cancelTransaction = async ({ requesterId, transactionId, requesteeId }: CancelTransactionParams) => {
    const requesterTxRef = doc(db, 'users', requesterId, 'transactions', transactionId);
    const requesterTxDoc = await getDoc(requesterTxRef);
    if (!requesterTxDoc.exists()) {
      throw new Error('Original request transaction not found.');
    }
    const { requestId } = requesterTxDoc.data();
    if (!requestId) {
      throw new Error('Request ID is missing.');
    }

    const requesteeTxQuery = query(
      collection(db, 'users', requesteeId, 'transactions'),
      where('requestId', '==', requestId),
      limit(1)
    );
    const requesteeQuerySnapshot = await getDocs(requesteeTxQuery);
    if (requesteeQuerySnapshot.empty) {
      throw new Error('Could not find the corresponding transaction for the other party.');
    }
    const requesteeTxRef = requesteeQuerySnapshot.docs[0].ref;

    const batch = writeBatch(db);
    batch.delete(requesterTxRef);
    batch.delete(requesteeTxRef);
    await batch.commit();
  };
  
  const submitAppeal = async (userId: string) => {
    if (!userId) throw new Error("User ID is required to submit an appeal.");
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { hasAppealed: true });
    await refreshUserData();
  };
  
  const createTicketTemplate = async (template: Omit<TicketTemplate, 'id' | 'issuerId' | 'issuerName' | 'createdAt' | 'issuanceCount'>) => {
    if (!user || !userData) throw new Error("User not authenticated");
    
    const templateData = {
        ...template,
        issuerId: user.uid,
        issuerName: `${userData.firstName} ${userData.lastName}`,
        createdAt: new Date().toISOString(),
        issuanceCount: 0
    };
    
    const templatesColRef = collection(db, "users", user.uid, "ticketTemplates");
    await addDoc(templatesColRef, templateData);
  }

  const updateTicketTemplate = async (templateId: string, data: Partial<Omit<TicketTemplate, 'id' | 'issuerId' | 'issuerName' | 'createdAt' | 'issuanceCount'>>) => {
    if (!user) throw new Error("User not authenticated");
    const templateRef = doc(db, "users", user.uid, "ticketTemplates", templateId);
    await updateDoc(templateRef, data);
  };

  const addTicketToWallet = async (linkId: string) => {
    if (!user) throw new Error("User not authenticated");

    await runTransaction(db, async (transaction) => {
        const linkRef = doc(db, "ticketLinks", linkId);
        const linkSnap = await transaction.get(linkRef);

        if (!linkSnap.exists() || linkSnap.data()?.used) {
            throw new Error("This link is invalid or has already been used.");
        }

        const { templateId, issuerId } = linkSnap.data();
        const templateRef = doc(db, "users", issuerId, "ticketTemplates", templateId);
        const templateSnap = await transaction.get(templateRef);

        if (!templateSnap.exists()) {
          throw new Error("Ticket template not found.");
        }
        const templateData = templateSnap.data() as TicketTemplate;

        if (templateData.issuanceLimit !== null && templateData.issuanceCount >= templateData.issuanceLimit) {
            throw new Error("This ticket has reached its issuance limit.");
        }

        if (templateData.expiresAt && new Date(templateData.expiresAt) < new Date()) {
            throw new Error("This ticket has expired.");
        }
        
        const walletItemData: Omit<WalletItem, 'id'> = {
            templateId: templateId,
            issuerId: templateData.issuerId,
            issuerName: templateData.issuerName,
            title: templateData.title,
            description: templateData.description,
            style: templateData.style,
            expiresAt: templateData.expiresAt || null,
            addedAt: new Date().toISOString(),
            status: 'valid'
        };
        
        const walletColRef = collection(db, "users", user.uid, "walletItems");
        const newWalletItemRef = doc(walletColRef);
        transaction.set(newWalletItemRef, walletItemData);
        transaction.update(templateRef, { issuanceCount: templateData.issuanceCount + 1 });
        transaction.update(linkRef, { used: true });
    });
  };

  const useTicket = async (ticketId: string, userId: string) => {
    if (!user || userData?.accountType !== 'business') throw new Error("Only businesses can redeem tickets.");
    
    const ticketRef = doc(db, "users", userId, "walletItems", ticketId);
    const ticketSnap = await getDoc(ticketRef);

    if (!ticketSnap.exists()) {
      throw new Error("Ticket not found in user's wallet.");
    }
    
    const ticketData = ticketSnap.data() as WalletItem;
    
    if (ticketData.issuerId !== user.uid) {
        throw new Error("This ticket was not issued by you.");
    }
    
    if (ticketData.status === 'used') {
        throw new Error("This ticket has already been used.");
    }

    if (ticketData.expiresAt && new Date(ticketData.expiresAt) < new Date()) {
        throw new Error("This ticket has expired.");
    }

    await updateDoc(ticketRef, {
        status: 'used',
        usedAt: new Date().toISOString()
    });
  };

  const createTicketLink = async (templateId: string) => {
    if (!user) throw new Error("User not authenticated.");
    const ticketLinksRef = collection(db, "ticketLinks");
    const newLinkRef = await addDoc(ticketLinksRef, {
        templateId,
        issuerId: user.uid,
        createdAt: serverTimestamp(),
        used: false,
    });
    return newLinkRef.id;
  };

  return (
    <AuthContext.Provider value={{ user, userData, transactions, walletItems, ticketTemplates, isAuthenticated: !!user, login, logout, signup, updateTheme, checkEmailExists, checkUsernameExists, searchUsers, getUserByUsername, getUserById, processTransaction, requestTransaction, declineTransaction, cancelTransaction, submitAppeal, isLoading, isLoggingOut, refreshUserData, addTicketToWallet, useTicket, createTicketTemplate, updateTicketTemplate, createTicketLink, paymentSuccessState, setPaymentSuccessState, clearPaymentSuccessState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
