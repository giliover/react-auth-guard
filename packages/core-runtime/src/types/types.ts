import { ReactNode, ComponentType } from "react";

export type UserRole = string;

export interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

export interface AuthProviderProps {
  children: ReactNode;
  initialRole?: UserRole;
}

export interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  factory: () => Promise<{ default: ComponentType<any> }>;
  loadingFallback?: ReactNode;
  redirectTo?: string;
}
