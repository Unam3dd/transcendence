import { Socket } from 'socket.io';
import { OnlineState } from 'src/enum/status.enum';

export interface UserSanitize {
  id: number;
  login: string;
  nickName: string;
  avatar: string;
}

export interface ListUserSanitizeInterface extends UserSanitize {
  clientID: string;
}

export interface ClientInfo extends UserSanitize {
  client: Socket;
  onlineState: OnlineState;
}

export interface JWTPayload {
  sub: number;
  login: string;
  nickName: string;
  iat: number;
  exp: number;
}

export interface FriendsUser {
  id: number;
  user1: number;
  user2: number;
  status: boolean;
  applicant: boolean;
}

export interface UserFriendsInfo extends UserSanitize {
  showOpt?: boolean;
  status: boolean;
  applicant: boolean;
  onlineState: OnlineState;
}

export interface UserStatus {
  id: number;
  onlineState: OnlineState;
}

export interface BlockedUser {
  id: number;
  user1: number;
  user2: number;
}

export interface beMessage {
  author: ListUserSanitizeInterface | null;
  content: string;
  createdAt: Date;
  recipient: ListUserSanitizeInterface | null;
}
