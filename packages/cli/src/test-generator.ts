import { Lexer } from "./lexer/index.js";
import { Parser } from "./parser/index.js";
import { SemanticAnalyzer } from "./analyzer/index.js";
import { CodeGenerator } from "./generator/index.js";

const dslScript = `
profile ADMIN;
profile USER;

route "/login" PUBLIC;
route "/dashboard" PROTECTED BY [USER, ADMIN] CHUNK "user-dashboard";
route "/admin" PROTECTED BY [ADMIN] CHUNK "admin-panel";
`;

try {
  console.log("=== EXECUTANDO PIPELINE COMPLETA DA CLI ===");

  // 1. Léxico
  const tokens = new Lexer(dslScript).tokenize();

  // 2. Sintático
  const ast = new Parser(tokens).parse();

  // 3. Semântico
  const errors = new SemanticAnalyzer(ast).analyze();
  if (errors.length > 0) {
    throw new Error(`Erros semânticos encontrados: ${errors.length}`);
  }

  // 4. Geração de Código
  const generator = new CodeGenerator(ast);
  const { authProviderCode, appRoutesCode } = generator.generate();

  console.log("\n--- [1] AuthProvider.tsx Gerado ---");
  console.log(authProviderCode);

  console.log("\n--- [2] AppRoutes.tsx Gerado ---");
  console.log(appRoutesCode);
} catch (error: any) {
  console.error("❌ Falha na geração:", error.message);
}
