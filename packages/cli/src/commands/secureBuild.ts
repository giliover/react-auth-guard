import fs from "fs";
import path from "path";
import { build, Plugin } from "esbuild";
import { Lexer } from "../lexer/index.js";
import { Parser } from "../parser/index.js";
import { encryptFile } from "../crypto/encrypt.js";

const reactGlobalPlugin: Plugin = {
  name: "react-global",
  setup(build) {
    build.onResolve({ filter: /^react$/ }, (args) => ({
      path: args.path,
      namespace: "react-global",
    }));
    build.onLoad({ filter: /.*/, namespace: "react-global" }, () => ({
      contents: `
      const R = (typeof window !== 'undefined' && window.React) || {};

        export default new Proxy(R, {
          get: (target, prop) => target[prop]
        });

        export const {
          createElement, cloneElement, isValidElement, createContext,
          Fragment, StrictMode, Suspense, Profiler, Component, PureComponent,
          Children, createRef, useState, useEffect, useContext, useReducer,
          useCallback, useMemo, useRef, useImperativeHandle, useLayoutEffect,
          useDebugValue, useDeferredValue, useTransition, useId,
          useSyncExternalStore, useInsertionEffect, useActionState,
          useOptimistic, use, memo, forwardRef, lazy, startTransition, act, version,
          __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
          __SERVER_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
        } = R;     
      `,
      loader: "js",
    }));
  },
};

export async function secureBuildCommand(
  buildDir: string = "build/static/js",
  dslFile: string = "security.auth",
) {
  const targetDir = path.resolve(process.cwd(), buildDir);
  const dslPath = path.resolve(process.cwd(), dslFile);

  if (!fs.existsSync(dslPath)) {
    console.error(`❌ Erro: Arquivo de políticas '${dslFile}' não encontrado.`);
    process.exit(1);
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  try {
    console.log(`🔒 Iniciando compilação e cifragem de módulos protegidos...`);

    const dslContent = fs.readFileSync(dslPath, "utf-8");
    const tokens = new Lexer(dslContent).tokenize();
    const ast = new Parser(tokens).parse();

    for (const route of ast.routes) {
      if (route.isPublic || !route.chunkName) continue;

      const primaryRole = route.allowedRoles[0] || "ADMIN";
      const roleKey = `KEY_${primaryRole}`;

      const moduleName =
        route.path
          .replace(/^\//, "")
          .split("/")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("") || "Home";

      const sourceModulePath = path.resolve(
        process.cwd(),
        `src/modules/${moduleName}.tsx`,
      );
      const tempJsPath = path.join(targetDir, `temp-${route.chunkName}.js`);
      const targetEncName = `protected-${route.chunkName}.chunk.enc`;

      if (!fs.existsSync(sourceModulePath)) {
        console.warn(
          `⚠️ Arquivo fonte do módulo não encontrado: ${sourceModulePath}`,
        );
        continue;
      }

      console.log(`  📦 Empacotando módulo ESM: ${moduleName}.tsx...`);

      await build({
        entryPoints: [sourceModulePath],
        bundle: true,
        outfile: tempJsPath,
        format: "esm",
        jsx: "transform",
        jsxFactory: "window.React.createElement",
        jsxFragment: "window.React.Fragment",
        plugins: [reactGlobalPlugin],
        target: "es2020",
        external: ["react-dom", "react-router-dom", "@react-auth/core-runtime"],
      });

      console.log(`  🔐 Criptografando asset: ${targetEncName}...`);
      encryptFile(tempJsPath, roleKey, targetEncName);

      console.log(`  ✅ Gerado com sucesso: ${targetEncName}`);
    }

    console.log(`✨ Processo concluído com sucesso!`);
  } catch (err: any) {
    console.error(`❌ Falha no secure-build: ${err.message}`);
    process.exit(1);
  }
}
