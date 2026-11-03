import { ProgramNode, RouteNode } from "../parser/ast.js";

export interface GeneratedFiles {
  authTypesCode: string;
  appRoutesCode: string;
}

export class CodeGenerator {
  private ast: ProgramNode;

  constructor(ast: ProgramNode) {
    this.ast = ast;
  }

  public generate(): GeneratedFiles {
    return {
      authTypesCode: this.generateAuthTypes(),
      appRoutesCode: this.generateAppRoutes(),
    };
  }

  private generateAuthTypes(): string {
    const profileUnion =
      this.ast.profiles.length > 0
        ? this.ast.profiles.map((p) => `'${p.name}'`).join(" | ")
        : "'PUBLIC'";

    return `// ARQUIVO GERADO AUTOMATICAMENTE VIA @react-auth/cli
export type AppRole = 'PUBLIC' | ${profileUnion};
`;
  }

  private generateAppRoutes(): string {
    const routeDeclarations = this.ast.routes
      .map((route) => this.buildRouteJSX(route))
      .join("\n");

    return `import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EncryptedProtectedRoute, AuthProvider } from '@react-auth/core-runtime';
import { AppRole } from './authTypes';

const LoadingFallback = () => <div className="auth-loading">Carregando...</div>;

export function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
${routeDeclarations}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
`;
  }

  private buildRouteJSX(route: RouteNode): string {
    const moduleName = this.getModuleName(route.path);
    const modulePath = `../modules/${moduleName}`;

    if (route.isPublic) {
      return `          <Route
            path="${route.path}"
            element={
              <Suspense fallback={<LoadingFallback />}>
                {React.createElement(lazy(() => import('${modulePath}')))}
              </Suspense>
            }
          />`;
    }

    const rolesArray = route.allowedRoles
      .map((r) => `'${r}' as AppRole`)
      .join(", ");
    const chunkFileName = `protected-${route.chunkName}.chunk.enc`;

    return `          <Route
            path="${route.path}"
            element={
              <EncryptedProtectedRoute
                allowedRoles={[${rolesArray}]}
                chunkUrl="/static/js/${chunkFileName}"
              />
            }
          />`;
  }

  private getModuleName(routePath: string): string {
    return (
      routePath
        .replace(/^\//, "")
        .split("/")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("") || "Home"
    );
  }
}
