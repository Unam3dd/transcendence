export interface TokensFrom42API extends Error {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  created_at: Date;
}

export interface UserInfoAPI extends Error {
  login: string;
  first_name: string;
  last_name: string;
  image: {
    link: string;
    versions: {
      large: string;
      medium: string;
      small: string;
      micro: string;
    };
  };
}
