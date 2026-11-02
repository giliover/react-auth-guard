import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider.js";
import { ProtectedRouteProps } from "./types/index.js";

const DefaultFallback = () => (
  <div className="auth-loading">Carregando módulo seguro...</div>
);

export function ProtectedRoute({
  allowedRoles,
  factory,
  loadingFallback = <DefaultFallback />,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { hasRole } = useAuth();

  // Trava de Execução: se o perfil não tiver acesso, o import dinâmico JAMAIS é invocado.
  if (!hasRole(allowedRoles)) {
    return <Navigate to={redirectTo} replace />;
  }

  const LazyComponent = lazy(factory);

  return (
    <Suspense fallback={loadingFallback}>
      <LazyComponent />
    </Suspense>
  );
}
