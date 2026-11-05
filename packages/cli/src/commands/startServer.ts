// packages/cli/src/commands/startServer.ts
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

export interface StartServerOptions {
  serverDir?: string;
}

export function startServerCommand(options: StartServerOptions = {}) {
  const { serverDir = "server" } = options;
  const targetServerDir = path.resolve(process.cwd(), serverDir);
  const serverFilePath = path.join(targetServerDir, "index.js");

  if (!fs.existsSync(serverFilePath)) {
    console.error(`❌ Erro: O arquivo '${serverFilePath}' não foi encontrado.`);
    console.error(
      `💡 Execute 'npx react-auth build' primeiro para compilar os artefatos.`,
    );
    process.exit(1);
  }

  console.log(`⚡ Iniciando o servidor RBAC (node ${serverFilePath})...`);

  const serverProcess = spawn("node", [serverFilePath], {
    stdio: "inherit",
    env: process.env,
  });

  serverProcess.on("error", (err) => {
    console.error(`❌ Erro ao iniciar o servidor: ${err.message}`);
    process.exit(1);
  });
}
