export interface User {
  UserID: string;
  GoogleID?: string | null;
  FacebookID?: string | null;
  Username: string;
  Email: string;
  Image?: string | null;
  IsVerified: boolean;
  LastVerifiedAt?: string | null;
  CreatedAt?: string;
  Conversations?: [];
  followers?: object[];
  IsFollowingCurrentUser?: boolean;
  Messages?: Message[];
}

export interface Conversation {
  ConversationID: string;
  CreatedAt: string;
  LastMessageAt: string;
  Name: string | null;
  IsGroup: boolean;
  Users: User[];
  Messages: Message[];
  OtherUser?: User;
}

export interface Message {
  MessageID: string;
  ConversationID: string;
  SenderID: string;
  Body?: string;
  Image: string | null;
  CreatedAt: string;
  SeenUsers?: User[];
}
