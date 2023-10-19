export interface UserInterface {
    id: number;
    login?: string;
    firstName?: string;
    lastName?: string;
    nickName?: string;
    email?: string;
    a2f?: boolean;
    avatar?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserSanitizeInterface {
    id: number;
    login: string;
    nickName: string;
    avatar: string;
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
    channel: string | number;
}

export interface PrivateMessage extends Message {
    recipient: UserSanitizeInterface;
}