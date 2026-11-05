import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

interface DynamicProtectedRouteProps {
  chunkName: string;
}

export const DynamicProtectedRoute: React.FC<DynamicProtectedRouteProps> = ({
  chunkName,
}) => {
  const { token } = useAuth();
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let blobUrl: string | null = null;

    async function fetchAndLoadChunk() {
      try {
        setLoading(true);
        const apiSecureChunk =
          process.env.API_SECURE_CHUNK ||
          "http://localhost:4000/api/secure-chunks";

        const response = await fetch(`${apiSecureChunk}/${chunkName}.js`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 403) {
          throw new Error(
            "Acesso Negado: Seu perfil não possui permissão para carregar este módulo.",
          );
        }

        if (!response.ok) {
          throw new Error(
            `Erro de rede ao carregar o módulo (${response.status})`,
          );
        }

        const jsCode = await response.text();
        const blob = new Blob([jsCode], { type: "application/javascript" });
        blobUrl = URL.createObjectURL(blob);

        const module = await import(/* webpackIgnore: true */ blobUrl);

        if (!module.default) {
          throw new Error("Módulo inválido: export default não encontrado.");
        }

        setComponent(() => module.default);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar componente.");
      } finally {
        setLoading(false);
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
        }
      }
    }

    fetchAndLoadChunk();
  }, [chunkName, token]);

  if (loading)
    return <div className="auth-loading">Carregando módulo seguro...</div>;
  if (error) return <div className="auth-error">❌ {error}</div>;
  if (!Component) return null;

  return <Component />;
};
