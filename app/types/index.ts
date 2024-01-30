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
  body?: string;
  image?: string;
  createdAt: string;
  seenStatus: MessageStatus[];
  deliverStatus: MessageStatus[];
  received?: boolean;
  user: User;
}

interface MessageStatus {
  seenAt: string;
  deliveredAt: string;
  user: User;
}
