import { Lexer } from "./lexer/index.js";

const sampleAuthScript = `
# Configuração de Segurança de Exemplo
profile ADMIN;
profile USER;

route "/login" PUBLIC;
route "/dashboard" PROTECTED BY [USER, ADMIN] CHUNK "user-dashboard";
route "/admin" PROTECTED BY [ADMIN] CHUNK "admin-panel";
`;

try {
  const lexer = new Lexer(sampleAuthScript);
  const tokens = lexer.tokenize();
  console.log("=== TOKENS GERADOS ===");
  console.table(tokens);
} catch (error: any) {
  console.error(error.message);
}
