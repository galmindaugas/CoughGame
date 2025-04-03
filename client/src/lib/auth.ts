import React, { createContext, useContext } from 'react';

type User = {
  id: number;
  username: string;
  isAdmin: number;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return React.createElement("div", null, children);
}

export const useAuth = () => useContext(AuthContext);