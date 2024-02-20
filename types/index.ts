export type Profile = {
  userId: string;
  username: string;
  image: string | null;
  createdAt?: string;
};

export type CurrentUser = Profile & {
  googleId: string | null;
  facebookId: string | null;
  email: string;
};

export type Member = {
  conversationId: string;
  joinedAt: string;
  isAdmin: boolean;
  userId: string;
  profile: Profile;
};

export type Session = {
  isCallbackProvider: boolean;
  isPasswordReset: boolean;
  user: {
    userId: string;
    email: string;
    isVerified: boolean;
  } | null;
};

export type Conversation = {
  conversationId: string;
  createdBy: string;
  createdAt?: string;
  name: string | null;
  image: string | null;
  isGroup: boolean;
  members: Member[];
  messages?: Message[];
  otherMember?: Member;
  otherMembers?: Member[];
  adminIds?: string[];
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
  profile: Profile;
};

export type GroupedMessages = {
  [conversationId: string]: {
    messages: Message[];
    unseenMessagesCount: number;
    joinedAt: string;
  };
} | null;

export type GroupedConversations = {
  [conversationId: string]: Conversation;
};

export type GroupedContacts = {
  [contactId: string]: Profile;
};
