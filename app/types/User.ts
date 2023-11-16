export interface User {
  UserID: string;
  GoogleID: string | null;
  FacebookID: string | null;
  Username: string;
  Email: string;
  Image: string | null;
  IsVerified: boolean;
  LastVerifiedAt: Date | null;
  CreatedAt: Date;
  ConversationIDs: [];
  SeenMessageIDs: [];
}
