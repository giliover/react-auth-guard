// packages/core-runtime/src/AuthProvider.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface UserAuthContextType {
  token: string | null;
  userRoles: string[];
  isAuthenticated: boolean;
  login: (token: string, roles: string[]) => void;
  logout: () => void;
}

const AuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  if (!window.React) window.React = React;

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("@react-auth/token");
  });

  const [userRoles, setUserRoles] = useState<string[]>(() => {
    const savedRoles = localStorage.getItem("@react-auth/roles");
    return savedRoles ? JSON.parse(savedRoles) : [];
  });

  const login = (newToken: string, roles: string[]) => {
    setToken(newToken);
    setUserRoles(roles);
    localStorage.setItem("@react-auth/token", newToken);
    localStorage.setItem("@react-auth/roles", JSON.stringify(roles));
  };

  const logout = () => {
    setToken(null);
    setUserRoles([]);
    localStorage.removeItem("@react-auth/token");
    localStorage.removeItem("@react-auth/roles");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userRoles,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): UserAuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuth deve ser utilizado obrigatoriamente dentro de um <AuthProvider>",
    );
  }
  return context;
};
