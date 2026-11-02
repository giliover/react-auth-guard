import { ProgramNode, RouteNode } from '../parser/ast.js';

export interface GeneratedFiles {
  authProviderCode: string;
  appRoutesCode: string;
}

export class CodeGenerator {
  private ast: ProgramNode;

  constructor(ast: ProgramNode) {
    this.ast = ast;
  }

  public generate(): GeneratedFiles {
    return {
      authProviderCode: this.generateAuthProvider(),
      appRoutesCode: this.generateAppRoutes()
    };
  }

  private generateAuthProvider(): string {
    const profileUnion = this.ast.profiles.length > 0
      ? this.ast.profiles.map(p => `'${p.name}'`).join(' | ')
      : "'PUBLIC'";

    return `// ============================================================================
// ARQUIVO GERADO AUTOMATICAMENTE VIA @react-auth/cli - NÃO EDITAR DIRETA MENTE
// ============================================================================

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'PUBLIC' | ${profileUnion};

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('PUBLIC');

  const hasRole = (allowedRoles: UserRole[]) => {
    if (allowedRoles.includes('PUBLIC')) return true;
    return allowedRoles.includes(role);
  };

  return (
    <AuthContext.Provider value={{ role, setRole, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
`;
  }

  private generateAppRoutes(): string {
    const routeDeclarations = this.ast.routes
      .map(route => this.buildRouteJSX(route))
      .join('\n');

    return `
// ============================================================================
// ARQUIVO GERADO AUTOMATICAMENTE VIA @react-auth/cli - NÃO EDITAR DIRETAMENTE
// ============================================================================

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, UserRole } from './AuthProvider';

const LoadingFallback = () => <div className="auth-loading">Carregando módulo...</div>;

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  factory: () => Promise<{ default: React.ComponentType<any> }>;
}

function ProtectedRoute({ allowedRoles, factory }: ProtectedRouteProps) {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  const LazyComponent = lazy(factory);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent />
    </Suspense>
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
${routeDeclarations}
      </Routes>
    </BrowserRouter>
  );
}
`;
  }

  private buildRouteJSX(route: RouteNode): string {
    // Deriva o caminho do módulo React na pasta src/modules/
    const moduleName = route.path
      .replace(/^\//, '')
      .split('/')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') || 'Home';

    const modulePath = `../modules/${moduleName}`;

    if (route.isPublic) {
      return `<Route
          path="${route.path}"
          element={
            <Suspense fallback={<LoadingFallback />}>
              {React.createElement(lazy(() => import('${modulePath}')))}
            </Suspense>
          }
        />`;
    }

    const rolesArray = route.allowedRoles.map(r => `'${r}'`).join(', ');
    const chunkComment = route.chunkName
      ? `/* webpackChunkName: "protected-${route.chunkName}" */ `
      : '';

    return `        <Route
          path="${route.path}"
          element={
            <ProtectedRoute
              allowedRoles={[${rolesArray}]}
              factory={() => import(${chunkComment}'${modulePath}')}
            />
          }
        />`;
  }
}
