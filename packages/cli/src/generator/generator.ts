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

    return `// ARQUIVO GERADO AUTOMATICAMENTE VIA @react-auth/cli - NÃO EDITAR DIRETA MENTE
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, AuthProvider } from '@react-auth/core-runtime';
import { AppRole } from './authTypes';

const LoadingFallback = () => <div className="auth-loading">Carregando módulo...</div>;

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
    const moduleName =
      route.path
        .replace(/^\//, "")
        .split("/")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("") || "Home";

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
    const chunkComment = route.chunkName
      ? `/* webpackChunkName: "protected-${route.chunkName}" */ `
      : "";

    return `          <Route
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
