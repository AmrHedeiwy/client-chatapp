export interface User {
  userId: string;
  googleId?: string | null;
  facebookId?: string | null;
  username: string;
  email: string;
  image?: string | null;
  isVerified: boolean;
  lastVerifiedAt?: string | null;
  createdAt?: string;
  conversations?: [];
  followers?: object[];
  isContact?: boolean;
  messages?: Message[];
}

export interface Conversation {
  conversationId: string;
  createdAt: string;
  lastMessageAt: string;
  name: string | null;
  isGroup: boolean;
  users: User[];
  messages: Message[];
  otherUser?: User;
  otherUsers?: User[];
  unseenMessagesCount: number;
  hasInitialNextPage: boolean;
}

export interface Message {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  fileUrl: string;
  createdAt: string;
  seenStatus: MessageStatus[];
  deliverStatus: MessageStatus[];
  received?: boolean;
  sender: User;
}

interface MessageStatus {
  seenAt: string;
  deliveredAt: string;
  user: User;
}

export type GroupedMessages = {
  [conversationId: string]: {
    messages: Message[];
    unseenMessagesCount: number;
  };
} | null;

export type GroupedConversations = {
  [conversationId: string]: Conversation;
} | null;
