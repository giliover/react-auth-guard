import React, { useState, useEffect, ComponentType } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider.js";
import { EncryptedProtectedRouteProps } from "./types/index.js";

export function EncryptedProtectedRoute({
  allowedRoles,
  chunkUrl,
  redirectTo = "/login",
}: EncryptedProtectedRouteProps) {
  const { role, hasRole, getRoleKey } = useAuth();
  const [Component, setComponent] = useState<ComponentType<any> | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    async function decryptAndLoad() {
      if (!hasRole(allowedRoles)) return;

      try {
        const roleKey = getRoleKey(role);

        if (!roleKey)
          throw new Error(
            `Chave de criptografia ausente para o perfil: ${role}`,
          );

        const response = await fetch(chunkUrl);
        const buffer = await response.arrayBuffer();

        const iv = buffer.slice(0, 12);
        const tag = buffer.slice(12, 28);
        const ciphertext = buffer.slice(28);

        const encryptedData = new Uint8Array(
          ciphertext.byteLength + tag.byteLength,
        );
        encryptedData.set(new Uint8Array(ciphertext), 0);
        encryptedData.set(new Uint8Array(tag), ciphertext.byteLength);

        const keyHash = await window.crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(roleKey),
        );

        const cryptoKey = await window.crypto.subtle.importKey(
          "raw",
          keyHash,
          { name: "AES-GCM" },
          false,
          ["decrypt"],
        );

        const decryptedBuffer = await window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv: new Uint8Array(iv), tagLength: 128 },
          cryptoKey,
          encryptedData,
        );

        const jsCode = new TextDecoder().decode(decryptedBuffer);
        const blob = new Blob([jsCode], { type: "application/javascript" });
        const blobUrl = URL.createObjectURL(blob);

        const module = await import(/* webpackIgnore: true */ blobUrl);
        URL.revokeObjectURL(blobUrl);

        setComponent(() => module.default);
      } catch (err) {
        console.error("[React-Auth] Erro ao descriptografar chunk:", err);
        setError(true);
      }
    }

    decryptAndLoad();
  }, [role]);

  if (!hasRole(allowedRoles) || error) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!Component) {
    return (
      <div className="auth-loading">Descriptografando módulo em memória...</div>
    );
  }

  return <Component />;
}
