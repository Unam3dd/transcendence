import { AxiosHeaders } from "axios";

export interface TokensFrom42API
{
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    created_at: Date;
}