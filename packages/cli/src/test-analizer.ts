import { Lexer } from "./lexer/index.js";
import { Parser } from "./parser/index.js";
import { SemanticAnalyzer } from "./analyzer/index.js";

// Exemplo com Erro Semântico Intencional: uso do perfil "GUEST" não declarado
const invalidScript = `
profile ADMIN;
profile USER;

route "/login" PUBLIC;
route "/dashboard" PROTECTED BY [USER, ADMIN] CHUNK "user-dashboard";
route "/metrics" PROTECTED BY [GUEST] CHUNK "user-dashboard";
`;

try {
  console.log("=== EXECUTANDO ANÁLISE SEMÂNTICA ===");
  const lexer = new Lexer(invalidScript);
  const tokens = lexer.tokenize();

  const parser = new Parser(tokens);
  const ast = parser.parse();

  const analyzer = new SemanticAnalyzer(ast);
  const errors = analyzer.analyze();

  if (errors.length > 0) {
    console.log("❌ Erros Semânticos Encontrados:");
    errors.forEach((err) =>
      console.error(` - Linha ${err.line}: ${err.message}`),
    );
  } else {
    console.log("✅ Análise semântica concluída sem erros!");
  }
} catch (error: any) {
  console.error(error.message);
}
