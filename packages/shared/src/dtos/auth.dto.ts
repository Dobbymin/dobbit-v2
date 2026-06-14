export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
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
  email: string;
  nickname: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}
