export interface UserInterface {
    id: number;
    login: string;
    firstName: string;
    lastName: string;
    nickName: string;
    email: string;
    a2f: boolean;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserSanitizeInterface {
    id: number;
    login: string;
    nickName: string;
}