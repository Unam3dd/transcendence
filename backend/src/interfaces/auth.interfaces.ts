export interface AuthTo42Data {
  grant_type: string;
  client_id: string;
  client_secret: string;
  code: string;
  redirect_uri: string;
}

export interface UserLocalInfo {
  login: string;
  firstName: string | null;
  lastName: string | null;
  nickName: string;
  email: string | null;
  password: string;
  a2f: boolean;
  avatar: string;
}