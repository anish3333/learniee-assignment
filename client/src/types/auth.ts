export interface User {
  id: string;
  username: string;
  email: string;
  isOnline: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AuthFormData {
  username: string;
  email: string;
  password: string;
}