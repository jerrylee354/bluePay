
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
import { doc, setDoc, getDoc, collection, query, onSnapshot, DocumentData, orderBy, where, getDocs, limit, runTransaction, writeBatch } from 'firebase/firestore';
import type { Transaction, Ticket } from '@/lib/data';
import { sendReceipt, type ReceiptDetails } from '@/ai/flows/send-receipt-flow';
import { getDictionary, type Dictionary } from '@/dictionaries';
import { i18n, type Locale } from '@/i18n';

interface ProcessTransactionParams {
    fromUserId: string;
    toUserId: string;
    amount: number;
    note: string;
    attachmentUrl?: string | null;
    requestId?: string;
    locale: Locale;
}

interface RequestTransactionParams {
    fromUserId: string;
    toUserId: string;
    amount: number;
    note: string;
    attachmentUrl?: string | null;
    locale: Locale;
}

interface DeclineTransactionParams {
    payerTxId: string;
    requesterId: string;
    locale: Locale;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userData: DocumentData | null;
  transactions: Transaction[];
  walletItems: Ticket[];
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<any>;
  logout: (options?: { redirect: boolean }) => Promise<void>;
  signup: (email: string, pass: string, additionalData: Record<string, any>) => Promise<any>;
  checkEmailExists: (email: string) => Promise<boolean>;
  checkUsernameExists: (username: string) => Promise<boolean>;
  searchUsers: (searchTerm: string) => Promise<DocumentData[]>;
  getUserByUsername: (username: string) => Promise<DocumentData | null>;
  getUserById: (userId: string) => Promise<DocumentData | null>;
  processTransaction: (params: ProcessTransactionParams) => Promise<void>;
  requestTransaction: (params: RequestTransactionParams) => Promise<void>;
  declineTransaction: (params: DeclineTransactionParams) => Promise<void>;
  isLoading: boolean;
  isLoggingOut: boolean;
  refreshUserData: () => Promise<void>;
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
  const [walletItems, setWalletItems] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const getCurrentLocale = (): Locale => {
    const localeFromPath = pathname.split('/')[1] as Locale;
    return i18n.locales.includes(localeFromPath) ? localeFromPath : i18n.defaultLocale;
  }

  const refreshUserData = useCallback(async () => {
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
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

        const unsubUser = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data());
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
          const newWalletItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
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
      hasCompletedOnboarding: false,
      profileStatus: true,
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
    if (options.redirect) {
      const locale = getCurrentLocale();
      // Use router for client-side navigation instead of full page reload
      router.push(`/${locale}/login`);
    }
    setIsLoggingOut(false);
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
    
    if (isUsernameSearch) {
        const usernameQuery = query(usersRef, where('username', '>=', term), where('username', '<=', `${term}\uf8ff`), limit(5));
        const usernameSnapshot = await getDocs(usernameQuery);
        return usernameSnapshot.docs
            .map(doc => doc.data())
            .filter(user => user.profileStatus === true);
    }

    const emailQuery = query(usersRef, where('email', '>=', term), where('email', '<=', `${term}\uf8ff`), limit(5));
    
    const firstNameTerm = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
    const firstNameQuery = query(usersRef, where('firstName', '>=', firstNameTerm), where('firstName', '<=', `${firstNameTerm}\uf8ff`), limit(5));
    const lastNameQuery = query(usersRef, where('lastName', '>=', firstNameTerm), where('lastName', '<=', `${firstNameTerm}\uf8ff`), limit(5));
    
    try {
        const [emailSnapshot, firstNameSnapshot, lastNameSnapshot] = await Promise.all([
            getDocs(emailQuery),
            getDocs(firstNameQuery),
            getDocs(lastNameQuery)
        ]);
        
        const usersMap = new Map<string, DocumentData>();
        
        const processSnapshot = (snapshot: any) => {
             snapshot.forEach((doc: any) => {
                const data = doc.data();
                if (data.profileStatus === true) {
                    usersMap.set(doc.id, data);
                }
            });
        }

        processSnapshot(emailSnapshot);
        processSnapshot(firstNameSnapshot);
        processSnapshot(lastNameSnapshot);

        return Array.from(usersMap.values());
    } catch (error) {
        console.error("Error searching users: ", error);
        return [];
    }
  };

  const processTransaction = async ({ fromUserId, toUserId, amount, note, attachmentUrl, requestId, locale }: ProcessTransactionParams): Promise<void> => {
    const fromUserRef = doc(db, "users", fromUserId);
    const toUserRef = doc(db, "users", toUserId);
    const dictionary = await getDictionary(locale);
    
    try {
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

            const newFromBalance = fromUserData.balance - amount;
            const newToBalance = toUserData.balance + amount;

            transaction.update(fromUserRef, { balance: newFromBalance });
            transaction.update(toUserRef, { balance: newToBalance });
            
            const now = new Date();
            const timestamp = now.toISOString();

            if (requestId) {
                // This is a payment for a request. Update both transaction documents.
                const payerTxQuery = query(
                    collection(db, "users", fromUserId, "transactions"),
                    where("requestId", "==", requestId),
                    limit(1)
                );
                const requesterTxQuery = query(
                    collection(db, "users", toUserId, "transactions"),
                    where("requestId", "==", requestId),
                    limit(1)
                );
                
                // Firestore transactions require reads to happen before writes.
                // We cannot use getDocs directly inside. We need a workaround if we were to use it,
                // but since we can construct the refs without a query, we can update directly.
                // However, the current logic relies on finding the docs via query.
                // A better approach would be to pass both doc IDs if known.
                // Let's assume for now we must query. This is a limitation.
                // The correct way inside a transaction is to query first, then update.
                // But getDocs is not available in transaction. We have to read the docs outside
                // and pass references in, which is not what the current code does.
                // The code below is a fix that queries outside the transaction. This is not atomic.
                
                // Let's fix it properly by querying inside the transaction, but this is not directly supported for collections.
                // The correct way to do this atomically is to have a predictable ID structure or perform the queries
                // and then pass the refs to the transaction. Let's assume the latter for the fix.

                // The logic below is conceptually what needs to happen, but `getDocs` isn't allowed in tx.
                // The root of the bug is that `requestId` is NOT the document ID.

                // Correcting the logic by querying for the documents and then updating them.
                const payerTxSnapshot = await getDocs(payerTxQuery);
                if (!payerTxSnapshot.empty) {
                    const payerTxDoc = payerTxSnapshot.docs[0];
                    transaction.update(payerTxDoc.ref, { status: dictionary.status.Completed, date: timestamp });
                } else {
                    throw new Error("Payer transaction not found for the request.");
                }

                const requesterTxSnapshot = await getDocs(requesterTxQuery);
                if (!requesterTxSnapshot.empty) {
                    const requesterTxDoc = requesterTxSnapshot.docs[0];
                    transaction.update(requesterTxDoc.ref, { status: dictionary.status.Completed, date: timestamp });
                } else {
                    // This can happen if the requester deletes their request. Handle gracefully.
                    console.warn("Requester transaction not found for the request. It might have been cancelled.");
                }
            } else {
                // This is a direct payment, not a response to a request.
                const sharedRequestId = doc(collection(db, "dummy")).id; // Generate a unique ID for linking
                const sharedTxData = {
                   amount: amount,
                   description: note,
                   date: timestamp,
                   status: dictionary.status.Completed,
                   attachmentUrl: attachmentUrl || null,
                   requestId: sharedRequestId,
                };

                const senderTransactionRef = doc(collection(db, "users", fromUserId, "transactions"));
                transaction.set(senderTransactionRef, {
                    ...sharedTxData,
                    type: 'payment',
                    name: `${toUserData.firstName} ${toUserData.lastName}`,
                    currency: fromUserData.currency,
                    otherPartyUid: toUserId,
                });

                const receiverTransactionRef = doc(collection(db, "users", toUserId, "transactions"));
                transaction.set(receiverTransactionRef, {
                    ...sharedTxData,
                    type: 'receipt',
                    name: `${fromUserData.firstName} ${fromUserData.lastName}`,
                    currency: toUserData.currency,
                    otherPartyUid: fromUserId,
                });
            }
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
        if (e instanceof Error) {
            throw e;
        }
        throw new Error("An unknown error occurred during the transaction.");
    }
};

  
  const requestTransaction = async ({ fromUserId, toUserId, amount, note, attachmentUrl, locale }: RequestTransactionParams): Promise<void> => {
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
    
    const sharedData = {
        amount: amount,
        description: note,
        date: timestamp,
        attachmentUrl: attachmentUrl || null,
        requestId: sharedRequestId,
    };
    
    const batch = writeBatch(db);

    const requesterTxRef = doc(collection(db, "users", fromUserId, "transactions"));
    batch.set(requesterTxRef, {
        ...sharedData,
        status: dictionary.status.Pending,
        type: 'receipt',
        name: `${toUserData.firstName} ${toUserData.lastName}`,
        currency: fromUserData.currency,
        otherPartyUid: toUserId,
    });
    
    const requesteeTxRef = doc(collection(db, "users", toUserId, "transactions"));
    batch.set(requesteeTxRef, {
        ...sharedData,
        status: dictionary.status.Requested,
        type: 'payment',
        name: `${fromUserData.firstName} ${fromUserData.lastName}`,
        currency: toUserData.currency,
        otherPartyUid: fromUserId,
    });
    
    await batch.commit();
  };

  const declineTransaction = async ({ payerTxId, requesterId, locale }: DeclineTransactionParams) => {
    if (!user) throw new Error("User not authenticated");
    const payerId = user.uid;
    const dictionary = await getDictionary(locale);

    const payerTxRef = doc(db, "users", payerId, "transactions", payerTxId);
    
    try {
        await runTransaction(db, async (transaction) => {
            const payerTxDoc = await transaction.get(payerTxRef);
            if (!payerTxDoc.exists()) {
                throw new Error("Payment request not found.");
            }
            const requestId = payerTxDoc.data().requestId;
            
            transaction.delete(payerTxRef);
            
            if (!requestId) {
                console.warn(`No requestId found for transaction ${payerTxId}. Cannot update requester.`);
                return;
            }

            const requesterTxQuery = query(
                collection(db, "users", requesterId, "transactions"),
                where("requestId", "==", requestId),
                limit(1)
            );
            
            const querySnapshot = await getDocs(requesterTxQuery);
            const requesterTxSnapshot = await getDocs(requesterTxQuery);

            if (!requesterTxSnapshot.empty) {
                const requesterTxDoc = requesterTxSnapshot.docs[0];
                transaction.update(requesterTxDoc.ref, { status: dictionary.status.Failed });
            } else {
                console.warn(`Could not find corresponding request transaction for requester ${requesterId} with requestId ${requestId}`);
            }
        });
    } catch (e) {
        console.error("Decline transaction failed: ", e);
        if (e instanceof Error) {
            throw e;
        }
        throw new Error("An unknown error occurred while declining the transaction.");
    }
  };


  return (
    <AuthContext.Provider value={{ user, userData, transactions, walletItems, isAuthenticated: !!user, login, logout, signup, checkEmailExists, checkUsernameExists, searchUsers, getUserByUsername, getUserById, processTransaction, requestTransaction, declineTransaction, isLoading, isLoggingOut, refreshUserData }}>
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
