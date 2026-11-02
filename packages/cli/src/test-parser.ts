import { Lexer } from "./lexer/index.js";
import { Parser } from "./parser/index.js";

const sampleScript = `
profile ADMIN;
profile USER;

route "/login" PUBLIC;
route "/dashboard" PROTECTED BY [USER, ADMIN] CHUNK "user-dashboard";
route "/admin" PROTECTED BY [ADMIN] CHUNK "admin-panel";
`;

try {
  const lexer = new Lexer(sampleScript);
  const tokens = lexer.tokenize();

  const parser = new Parser(tokens);
  const ast = parser.parse();

  console.log("=== ÁRVORE DE SINTAXE ABSTRATA (AST) ===");
  console.log(JSON.stringify(ast, null, 2));
} catch (error: any) {
  console.error(error.message);
}
