import { Socket } from "socket.io-client";

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
    client: Socket;
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
    author: UserSanitizeInterface;
    content: string;
    createdAt: Date;
    recipient: UserSanitizeInterface | null;
}

export interface UserFriendsInfo extends UserSanitizeInterface {
    showOpt: boolean;
}