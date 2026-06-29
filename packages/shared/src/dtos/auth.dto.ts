export interface SignupRequest {
  username: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    nickname: string;
  };
}

export interface RefreshResponse {
  accessToken: string;
}

export interface LogoutResponse {
  success: true;
}

export interface MeResponse {
  id: string;
  username: string;
  nickname: string;
}

export interface TokenPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}
