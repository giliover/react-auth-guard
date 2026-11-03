import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType, AuthProviderProps, UserRole } from "./types/index.js";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialRole = "PUBLIC",
}: AuthProviderProps) {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [keys, setKeys] = useState<Record<UserRole, string>>({});

  const setAuth = (newRole: UserRole, newKeys: Record<UserRole, string>) => {
    setRole(newRole);
    setKeys(newKeys);
  };

  const getRoleKey = (targetRole: UserRole): string | null => {
    return keys[targetRole] || null;
  };

  const hasRole = (allowedRoles: UserRole[]) => {
    if (allowedRoles.includes("PUBLIC")) return true;
    return allowedRoles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{ role, setRole, keys, setKeys, setAuth, getRoleKey, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um <AuthProvider>");
  }
  return context;
};
