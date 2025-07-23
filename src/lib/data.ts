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

export type Ticket = {
  id: string;
  type: 'ticket' | 'coupon';
  title: string;
  issuer: string;
  expiryDate: string;
  imageUrl: string;
  imageHint: string;
};
