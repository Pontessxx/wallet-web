export interface User {
  id: string;
  username: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userId: string, username: string, accessToken: string) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  userId: string;
  username: string;
}