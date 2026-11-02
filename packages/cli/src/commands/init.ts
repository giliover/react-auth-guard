import fs from "fs";
import path from "path";

const defaultDslTemplate = `# ============================================================================
# Configuração de Autenticação e Perfis (DSL @react-auth)
# ============================================================================

profile ADMIN;
profile USER;

# Rotas Públicas
route "/login" PUBLIC;

# Rotas Protegidas por Perfil
route "/dashboard" PROTECTED BY [USER, ADMIN] CHUNK "user-dashboard";
route "/admin" PROTECTED BY [ADMIN] CHUNK "admin-panel";
`;

export function initCommand(filename: string = "security.auth") {
  const targetPath = path.resolve(process.cwd(), filename);

  if (fs.existsSync(targetPath)) {
    console.log(`⚠️ O arquivo '${filename}' já existe no diretório atual.`);
    return;
  }

  fs.writeFileSync(targetPath, defaultDslTemplate, "utf-8");
  console.log(`✅ Arquivo de modelo '${filename}' criado com sucesso!`);
}
