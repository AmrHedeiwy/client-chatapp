import { MessageStatus } from '@/types';
import { create } from 'zustand';

export type ModalType =
  | 'createGroupChat'
  | 'updateUserProfile'
  | 'messageFile'
  | 'removeContact'
  | 'messageStatus'
  | 'deleteMessage';

type ModalData = {
  contact?: { username?: string; confirm?: (action: 'remove') => void };
  messageStatus?: { status: MessageStatus[]; isGroup: boolean };
  deleteMessage?: { conversationId: string; messageId: string };
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
