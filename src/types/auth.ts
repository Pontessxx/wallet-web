export interface User {
    id: string;
    username: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, expiresIn?: number) => void;
  logout: () => void;
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
  user: {
    id: string;
    username: string;
  };
}