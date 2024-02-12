export type Profile = {
  userId: string;
  username: string;
  image: string | null;
};

export type CurrentUser = Profile & {
  googleId: string | null;
  facebookId: string | null;
  email: string;
  createdAt: string;
};

export type User = Profile & {
  createdAt: string;
  isContact: boolean;
};

export type Member = Profile & {
  conversationId: string;
  joinedAt: string;
  isAdmin: boolean;
};

export type Session = {
  isCallbackProvider: boolean;
  isPasswordReset: boolean;
  user: {
    userId: string;
    email: string;
    lastVerifiedAt: string | null;
  } | null;
};

export type Conversation = {
  conversationId: string;
  createdAt: string;
  lastMessageAt: string;
  name: string | null;
  image: string | null;
  isGroup: boolean;
  members: Member[];
  messages: Message[];
  otherMember?: Member;
  otherMembers?: Member[];
  adminIds: string[];
  unseenMessagesCount: number;
  hasInitialNextPage: boolean;
};

export type Message = {
  messageId: string;
  conversationId: string;
  content: string | null;
  fileUrl: string | null;
  sentAt: string;
  updatedAt: string;
  deletedAt: string | null;
  seenCount: number;
  deliverCount: number;
  status: { [userId: string]: MessageStatus };
  notReceived?: boolean;
  sender: Profile;
};

export type MessageStatus = {
  deliverAt: string;
  seenAt: string;
  user: Profile;
};

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
