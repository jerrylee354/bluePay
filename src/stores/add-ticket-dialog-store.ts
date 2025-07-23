import { create } from 'zustand';

type AddTicketDialogState = {
  isOpen: boolean;
  templateId: string | null;
  issuerId: string | null;
  openDialog: (templateId: string, issuerId: string) => void;
  closeDialog: () => void;
};

export const useAddTicketDialogStore = create<AddTicketDialogState>((set) => ({
  isOpen: false,
  templateId: null,
  issuerId: null,
  openDialog: (templateId, issuerId) => set({ isOpen: true, templateId, issuerId }),
  closeDialog: () => set({ isOpen: false, templateId: null, issuerId: null }),
}));
