import { Socket } from "socket.io-client";
import { OnlineState } from "../enum/status.enum";

export interface UserInterface {
    id?: number;
    login?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    nickName?: string | null;
    email?: string | null;
    password?: string | null;
    a2f?: boolean | null;
    avatar?: string | null;
    is42: boolean;
    a2fsecret: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserSanitizeInterface {
    id: number;
    login: string;
    nickName: string;
    avatar: string;
}

export interface ClientInfoInterface extends UserSanitizeInterface {
    clientID: string;
}

export interface JWTPayload {
    sub: number;
    login: string;
    nickName: string;
    avatar: string;
    iat: number;
    exp: number;
}

export interface Message {
    author: ClientInfoInterface;
    content: string;
    createdAt: Date;
    recipient: ClientInfoInterface| null;
}

export interface UserFriendsInfo extends UserSanitizeInterface {
    showOpt: boolean;
    status: boolean;
    applicant: boolean;
    onlineState: OnlineState;
}

export interface Friends{
    id: number,
    user1: number,
    user2: number,
    status: boolean,
    applicant: boolean
}

export interface UserStatus {
    id: number;
    onlineState: OnlineState;
    applicant?: boolean;
}

export interface BlockedUser {
    id: number;
    user1: number;
    user2: number;
}