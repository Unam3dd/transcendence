export interface UserSanitize {
  id: number;
  login: string;
  nickName: string;
}

export interface JWTPayload {
  sub: number,
  login: string,
  nickName: string,
  iat: number,
  exp: number
}
