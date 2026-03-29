export interface LoginRequest {
  email: string;
  password: string;
  remember: boolean;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn?: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  iat: number;
  exp: number;
  jti?: string;
}

export interface UserModel {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export type OAuthProvider = 'google' | 'microsoft' | 'github';

export interface LogoutRequest {
  everywhere?: boolean;
}
