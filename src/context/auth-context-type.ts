import { createContext } from 'react';
import type { User } from '../types/auth';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
