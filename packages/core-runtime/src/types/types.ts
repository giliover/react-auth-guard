import { ReactNode } from "react";

export type UserRole = string;

export interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  keys: Record<UserRole, string>;
  setKeys: (keys: Record<UserRole, string>) => void;
  setAuth: (role: UserRole, keys: Record<UserRole, string>) => void;
  getRoleKey: (role: UserRole) => string | null;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

export interface AuthProviderProps {
  children: ReactNode;
  initialRole?: UserRole;
}

export interface EncryptedProtectedRouteProps {
  allowedRoles: string[];
  chunkUrl: string;
  redirectTo?: string;
}
