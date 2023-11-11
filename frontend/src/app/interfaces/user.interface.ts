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

export interface UserFriendsInfo extends UserSanitizeInterface {
    showOpt: boolean;
}

export interface gameInvitationPayload {
    gameId: string;
    host: string;
}
