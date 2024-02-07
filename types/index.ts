export interface User {
  userId: string;
  googleId?: string | null;
  facebookId?: string | null;
  username: string;
  email: string;
  image: string | null;
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
  image: string | null;
  isGroup: boolean;
  members: User[];
  messages: Message[];
  otherMember?: User;
  otherMembers?: User[];
  adminIds: string[];
  unseenMessagesCount: number;
  hasInitialNextPage: boolean;
}

export interface Message {
  messageId: string;
  conversationId: string;
  content: string;
  fileUrl: string;
  sentAt: string;
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
};

export type GroupedContacts = {
  [contactId: string]: User;
};
