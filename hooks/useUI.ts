import { CurrentUser, MessageStatus } from '@/types';
import { create } from 'zustand';

export type ModalType =
  | 'createGroupChat'
  | 'userProfile'
  | 'messageFile'
  | 'removeContact'
  | 'messageStatus'
  | 'deleteMessage'
  | 'viewImage'
  | 'removeMember'
  | 'confirmAdminStatus'
  | 'removeConversation'
  | 'deleteConversation'
  | 'deleteAccount';

type ModalData = {
  contact?: { username: string; contactId: string };
  messageStatus?: { status: MessageStatus[]; isGroup: boolean };
  deleteMessage?: { messageId: string };
  messageFile?: { intialMessageStatus: MessageStatus[] };
  viewImage?: { image: string };
  member?: { username: string; userId: string };
  adminStatus?: { setStatus: 'promote' | 'demote'; memberId: string; username: string };
  conversation?: { memberId: string; name: string; isGroup?: boolean };
};

type ModalStore = {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: any) => void;
  onClose: () => void;
};

export type SheetType = 'conversationProfile';

type SheetData = {
  conversationProfile?: {
    conversationId: string;
  };
};

type SheetStore = {
  type: SheetType | null;
  data: SheetData;
  isOpen: boolean;
  onOpen: (type: SheetType, data?: any) => void;
  onClose: () => void;
};

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false })
}));

export const useSheet = create<SheetStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false })
}));
