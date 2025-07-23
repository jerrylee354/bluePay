
import { create } from 'zustand';

type PayDialogState = {
  isPayDialogOpen: boolean;
  selectedUserId: string | null;
  mode: 'pay' | 'request';
  setPayDialogState: (isOpen: boolean) => void;
  setSelectedUser: (userId: string | null, mode: 'pay' | 'request') => void;
};

export const usePayDialogStore = create<PayDialogState>((set) => ({
  isPayDialogOpen: false,
  selectedUserId: null,
  mode: 'pay',
  setPayDialogState: (isOpen) => set({ isPayDialogOpen: isOpen, selectedUserId: isOpen ? undefined : null }),
  setSelectedUser: (userId, mode) => set({ selectedUserId: userId, mode, isPayDialogOpen: !!userId }),
}));
