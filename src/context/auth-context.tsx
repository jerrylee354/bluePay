
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, onSnapshot, DocumentData, orderBy, where, getDocs, limit, runTransaction, serverTimestamp, writeBatch, collectionGroup, deleteDoc } from 'firebase/firestore';
import type { Transaction, Ticket } from '@/lib/data';

interface ProcessTransactionParams {
    fromUserId: string;
    toUserId: string;
    amount: number;
    note: string;
    attachmentUrl?: string | null;
    requestId?: string; // ID of the request transaction for the payer
}

interface RequestTransactionParams {
    fromUserId: string; // The user making the request
    toUserId: string;   // The user being requested from
    amount: number;
    note: string;
    attachmentUrl?: string | null;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userData: DocumentData | null;
  transactions: Transaction[];
  walletItems: Ticket[];
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  signup: (email: string, pass: string, additionalData: Record<string, any>) => Promise<any>;
  checkEmailExists: (email: string) => Promise<boolean>;
  checkUsernameExists: (username: string) => Promise<boolean>;
  searchUsers: (searchTerm: string) => Promise<DocumentData[]>;
  getUserByUsername: (username: string) => Promise<DocumentData | null>;
  getUserById: (userId: string) => Promise<DocumentData | null>;
  processTransaction: (params: ProcessTransactionParams) => Promise<void>;
  requestTransaction: (params: RequestTransactionParams) => Promise<void>;
  declineTransaction: (payerTxId: string, requesterId: string) => Promise<void>;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletItems, setWalletItems] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
      createdAt: new Date(),
    };

    await setDoc(doc(db, "users", user.uid), newUserData);
    
    setUserData(newUserData);

    return userCredential;
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
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
    
    // Handle both formats: 'username' and '@username'
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
        return usernameSnapshot.docs.map(doc => doc.data());
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
        
        emailSnapshot.forEach(doc => usersMap.set(doc.id, doc.data()));
        firstNameSnapshot.forEach(doc => usersMap.set(doc.id, doc.data()));
        lastNameSnapshot.forEach(doc => usersMap.set(doc.id, doc.data()));

        return Array.from(usersMap.values());
    } catch (error) {
        console.error("Error searching users: ", error);
        return [];
    }
  };

  const processTransaction = async ({ fromUserId, toUserId, amount, note, attachmentUrl, requestId }: ProcessTransactionParams) => {
    const fromUserRef = doc(db, "users", fromUserId);
    const toUserRef = doc(db, "users", toUserId);
    
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
        
        if (requestId) {
            // This is a payment confirmation for a request.
            // Find the sender's (payer's) request transaction and update it.
            const payerTransactionRef = doc(db, "users", fromUserId, "transactions", requestId);
            
            // To update the requester's side, we need to find their corresponding transaction.
            const requesterTxQuery = query(
                collection(db, "users", toUserId, "transactions"),
                where("requestId", "==", requestId),
                limit(1)
            );
            
            // This needs to be outside the transaction.get, so we get it before the transaction starts
            const requesterTxSnapshot = await getDocs(requesterTxQuery);
            
            if (!requesterTxSnapshot.empty) {
                const requesterTxDoc = requesterTxSnapshot.docs[0];
                transaction.update(requesterTxDoc.ref, { status: 'Completed' });
            }

            transaction.update(payerTransactionRef, { status: 'Completed' });

        } else {
             const now = new Date();
             const timestamp = now.toISOString();
             const sharedRequestId = doc(collection(db, "dummy")).id;

             const sharedTxData = {
               amount: amount,
               description: note,
               date: timestamp,
               status: 'Completed',
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
  
  const requestTransaction = async ({ fromUserId, toUserId, amount, note, attachmentUrl }: RequestTransactionParams) => {
    const fromUserRef = doc(db, "users", fromUserId);
    const toUserRef = doc(db, "users", toUserId);

    const fromUserDoc = await getDoc(fromUserRef);
    const toUserDoc = await getDoc(toUserRef);
    
    if (!fromUserDoc.exists() || !toUserDoc.exists()) {
        throw new Error("User not found.");
    }
    
    const fromUserData = fromUserDoc.data();
    const toUserData = toUserDoc.data();

    const now = new Date();
    const timestamp = now.toISOString();
    const sharedRequestId = doc(collection(db, "dummy")).id; // Generate a unique ID for both tx
    
    const sharedData = {
        amount: amount,
        description: note,
        date: timestamp,
        attachmentUrl: attachmentUrl || null,
        requestId: sharedRequestId,
    };
    
    const batch = writeBatch(db);

    // Record for requester (fromUser, who will get paid)
    const requesterTxRef = doc(collection(db, "users", fromUserId, "transactions"));
    batch.set(requesterTxRef, {
        ...sharedData,
        status: 'Pending', // Requester sees 'Pending' until it's paid
        type: 'receipt', // It's an incoming payment for them
        name: `${toUserData.firstName} ${toUserData.lastName}`,
        currency: fromUserData.currency,
        otherPartyUid: toUserId,
    });
    
    // Record for requestee (toUser, who needs to pay)
    const requesteeTxRef = doc(collection(db, "users", toUserId, "transactions"));
    batch.set(requesteeTxRef, {
        ...sharedData,
        status: 'Requested', // Requestee sees 'Requested' and can act on it
        type: 'payment', // It's an outgoing payment for them
        name: `${fromUserData.firstName} ${fromUserData.lastName}`,
        currency: toUserData.currency,
        otherPartyUid: fromUserId,
    });
    
    await batch.commit();
  };

  const declineTransaction = async (payerTxId: string, requesterId: string) => {
    if (!user) throw new Error("User not authenticated");
    const payerId = user.uid;

    const payerTxRef = doc(db, "users", payerId, "transactions", payerTxId);
    
    try {
        await runTransaction(db, async (transaction) => {
            const payerTxDoc = await transaction.get(payerTxRef);
            if (!payerTxDoc.exists()) {
                throw new Error("Payment request not found.");
            }
            const requestId = payerTxDoc.data().requestId;
            
            // 1. Delete the payer's transaction record
            transaction.delete(payerTxRef);
            
            // If there's no requestId (e.g., old data), we can't update the requester.
            // The payer's request is still removed, which is the primary goal.
            if (!requestId) {
                console.warn(`No requestId found for transaction ${payerTxId}. Cannot update requester.`);
                return;
            }

            // 2. Find and update the requester's transaction to "Failed"
            const requesterTxQuery = query(
                collection(db, "users", requesterId, "transactions"),
                where("requestId", "==", requestId),
                limit(1)
            );
            // This get must be outside the transaction scope to work with runTransaction
            const requesterTxSnapshot = await getDocs(requesterTxQuery);

            if (!requesterTxSnapshot.empty) {
                const requesterTxDoc = requesterTxSnapshot.docs[0];
                transaction.update(requesterTxDoc.ref, { status: 'Failed' });
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
    <AuthContext.Provider value={{ user, userData, transactions, walletItems, isAuthenticated: !!user, login, logout, signup, checkEmailExists, checkUsernameExists, searchUsers, getUserByUsername, getUserById, processTransaction, requestTransaction, declineTransaction, isLoading, refreshUserData }}>
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
