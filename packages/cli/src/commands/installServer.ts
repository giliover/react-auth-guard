// packages/cli/src/commands/installServer.ts
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

export interface InstallServerOptions {
  serverDir?: string;
}

export function installServerCommand(options: InstallServerOptions = {}) {
  const { serverDir = "server" } = options;
  const targetServerDir = path.resolve(process.cwd(), serverDir);
  const packageJsonPath = path.join(targetServerDir, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    console.error(
      `❌ Erro: O arquivo '${packageJsonPath}' não foi encontrado.`,
    );
    console.error(
      `💡 Execute 'react-auth build' primeiro para gerar a estrutura do servidor.`,
    );
    process.exit(1);
  }

  console.log(`📦 Instalando dependências do servidor em '${serverDir}'...`);

  // Trata compatibilidade do npm entre Windows (npm.cmd) e Unix
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

  const installProcess = spawn(npmCmd, ["install"], {
    cwd: targetServerDir,
    stdio: "inherit",
    shell: true,
  });

  installProcess.on("error", (err) => {
    console.error(`❌ Erro ao executar 'npm install': ${err.message}`);
    process.exit(1);
  });

  installProcess.on("close", (code) => {
    if (code === 0) {
      console.log(`✅ Dependências do servidor instaladas com sucesso!`);
    } else {
      console.error(`❌ 'npm install' finalizou com código de erro ${code}.`);
      process.exit(code || 1);
    }
  });
}
