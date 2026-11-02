export enum TokenType {
  // Palavras-chave
  TOK_PROFILE = "TOK_PROFILE", // profile
  TOK_ROUTE = "TOK_ROUTE", // route
  TOK_PUBLIC = "TOK_PUBLIC", // PUBLIC
  TOK_PROTECTED = "TOK_PROTECTED", // PROTECTED
  TOK_BY = "TOK_BY", // BY
  TOK_CHUNK = "TOK_CHUNK", // CHUNK

  // Símbolos e Pontuação
  TOK_SEMI = "TOK_SEMI", // ;
  TOK_LBRACKET = "TOK_LBRACKET", // [
  TOK_RBRACKET = "TOK_RBRACKET", // ]
  TOK_COMMA = "TOK_COMMA", // ,

  // Literais e Identificadores
  TOK_ID = "TOK_ID", // Ex: ADMIN, USER, loginRoute
  TOK_STRING = "TOK_STRING", // Ex: "/dashboard", "admin-panel"

  // Controle
  TOK_EOF = "TOK_EOF", // Fim do arquivo (End Of File)
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

// Mapeamento de palavras reservadas da DSL
export const KEYWORDS: Record<string, TokenType> = {
  profile: TokenType.TOK_PROFILE,
  route: TokenType.TOK_ROUTE,
  PUBLIC: TokenType.TOK_PUBLIC,
  PROTECTED: TokenType.TOK_PROTECTED,
  BY: TokenType.TOK_BY,
  CHUNK: TokenType.TOK_CHUNK,
};
