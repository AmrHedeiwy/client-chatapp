export interface User {
  UserID: string;
  GoogleID: string | null;
  FacebookID: string | null;
  Username: string;
  Email: string;
  Image: string | undefined;
  IsVerified: boolean;
  LastVerifiedAt: Date | null;
  CreatedAt: Date;
  ConversationIDs: [];
  followers: object[];
  IsFollowingCurrentUser?: boolean;
}
