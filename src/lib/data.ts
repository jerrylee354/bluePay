import { DocumentData } from "firebase/firestore";
import { OrderItem } from "@/components/payment-confirm";

export type Transaction = {
  id: string;
  type: 'payment' | 'receipt';
  name: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed' | 'Requested';
  description: string;
  attachmentUrl?: string | null;
  otherPartyUid: string;
  otherParty?: DocumentData | null;
  orderItems?: OrderItem[];
};

export type WalletItem = {
  id: string;
  templateId: string;
  issuerId: string;
  issuerName: string;
  title: string;
  addedAt: string;
  status: 'valid' | 'used';
  usedAt?: string;
  style?: {
    backgroundColor: string;
    textColor: string;
  }
};

export type TicketTemplate = {
    id: string;
    issuerId: string;
    issuerName: string;
    title: string;
    createdAt: string;
    style: {
        backgroundColor: string;
        textColor: string;
    };
};
