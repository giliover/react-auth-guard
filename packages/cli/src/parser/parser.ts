import { Token, TokenType } from "../lexer/tokens.js";
import { ProgramNode, ProfileNode, RouteNode } from "./ast.js";

export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parse(): ProgramNode {
    const program: ProgramNode = {
      type: "Program",
      profiles: [],
      routes: [],
    };

    // StmtList -> Stmt StmtList | ε
    while (!this.isAtEnd()) {
      const peekToken = this.peek();

      if (peekToken.type === TokenType.TOK_PROFILE) {
        program.profiles.push(this.parseProfileStmt());
      } else if (peekToken.type === TokenType.TOK_ROUTE) {
        program.routes.push(this.parseRouteStmt());
      } else {
        throw new Error(
          `[Erro Sintático] Token inesperado '${peekToken.value}' na linha ${peekToken.line}, coluna ${peekToken.column}. Esperava 'profile' ou 'route'.`,
        );
      }
    }

    return program;
  }

  // ProfileStmt -> profile ID ;
  private parseProfileStmt(): ProfileNode {
    this.consume(TokenType.TOK_PROFILE, "Esperado 'profile'");

    const idToken = this.consume(
      TokenType.TOK_ID,
      "Esperado o nome do perfil (ID)",
    );
    this.consume(TokenType.TOK_SEMI, "Esperado ';' após o perfil");

    return {
      type: "Profile",
      name: idToken.value,
      line: idToken.line,
    };
  }

  // RouteStmt -> route STRING AccessRule ;
  private parseRouteStmt(): RouteNode {
    this.consume(TokenType.TOK_ROUTE, "Esperado 'route'");

    const pathToken = this.consume(
      TokenType.TOK_STRING,
      "Esperada a rota entre aspas (STRING)",
    );
    const accessRule = this.parseAccessRule();

    this.consume(TokenType.TOK_SEMI, "Esperado ';' após a instrução de rota");

    return {
      type: "Route",
      path: pathToken.value,
      isPublic: accessRule.isPublic,
      allowedRoles: accessRule.allowedRoles,
      chunkName: accessRule.chunkName,
      line: pathToken.line,
    };
  }

  // AccessRule -> PUBLIC | PROTECTED BY [ RoleList ] CHUNK STRING
  private parseAccessRule(): {
    isPublic: boolean;
    allowedRoles: string[];
    chunkName?: string;
  } {
    const token = this.peek();

    if (token.type === TokenType.TOK_PUBLIC) {
      this.advance();
      return { isPublic: true, allowedRoles: [] };
    }

    if (token.type === TokenType.TOK_PROTECTED) {
      this.advance();
      this.consume(TokenType.TOK_BY, "Esperado 'BY' após 'PROTECTED'");
      this.consume(
        TokenType.TOK_LBRACKET,
        "Esperado '[' para iniciar a lista de perfis",
      );

      const allowedRoles = this.parseRoleList();

      this.consume(
        TokenType.TOK_RBRACKET,
        "Esperado ']' para fechar a lista de perfis",
      );
      this.consume(
        TokenType.TOK_CHUNK,
        "Esperado 'CHUNK' após a lista de perfis",
      );

      const chunkToken = this.consume(
        TokenType.TOK_STRING,
        "Esperado o nome do chunk entre aspas (STRING)",
      );

      return {
        isPublic: false,
        allowedRoles,
        chunkName: chunkToken.value,
      };
    }

    throw new Error(
      `[Erro Sintático] Regra de acesso inválida '${token.value}' na linha ${token.line}. Esperado 'PUBLIC' ou 'PROTECTED'.`,
    );
  }

  // RoleList -> ID RoleListTail
  // RoleListTail -> , ID RoleListTail | ε
  private parseRoleList(): string[] {
    const roles: string[] = [];

    const firstRole = this.consume(
      TokenType.TOK_ID,
      "Esperado pelo menos um perfil de acesso na lista",
    );
    roles.push(firstRole.value);

    while (this.peek().type === TokenType.TOK_COMMA) {
      this.advance(); // Pula a vírgula
      const nextRole = this.consume(
        TokenType.TOK_ID,
        "Esperado nome do perfil após a vírgula",
      );
      roles.push(nextRole.value);
    }

    return roles;
  }

  private consume(expectedType: TokenType, errorMessage: string): Token {
    const currentToken = this.peek();

    if (currentToken.type !== expectedType) {
      throw new Error(
        `[Erro Sintático] ${errorMessage}. Encontrado '${currentToken.value}' (${currentToken.type}) na linha ${currentToken.line}, coluna ${currentToken.column}.`,
      );
    }

    return this.advance();
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.TOK_EOF;
  }
}
