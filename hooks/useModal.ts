import { create } from 'zustand';

export type ModalType =
  | 'createGroupChat'
  | 'updateUserProfile'
  | 'messageFile'
  | 'removeContact'
  | 'messageStatus';

type ModalData = {
  contact?: { username?: string; confirm?: (action: 'remove') => void };
  messageStatus?: { status: any[]; isGroup: boolean };
};

type ModalStore = {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: any) => void;
  onClose: () => void;
};

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false })
}));
