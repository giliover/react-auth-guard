import { ProgramNode } from "../parser/ast.js";

export interface SemanticError {
  message: string;
  line: number;
}

export class SemanticAnalyzer {
  private ast: ProgramNode;
  private declaredProfiles: Set<string> = new Set();
  private declaredPaths: Set<string> = new Set();
  private usedChunkNames: Set<string> = new Set();
  private errors: SemanticError[] = [];

  constructor(ast: ProgramNode) {
    this.ast = ast;
  }

  public analyze(): SemanticError[] {
    this.errors = [];
    this.declaredProfiles.clear();
    this.declaredPaths.clear();
    this.usedChunkNames.clear();

    // 1. Coleta e validação de Perfis
    for (const profile of this.ast.profiles) {
      if (this.declaredProfiles.has(profile.name)) {
        this.errors.push({
          message: `[Erro Semântico] O perfil '${profile.name}' foi declarado mais de uma vez.`,
          line: profile.line,
        });
      } else {
        this.declaredProfiles.add(profile.name);
      }
    }

    // 2. Validação das Rotas e Regras de Acesso
    for (const route of this.ast.routes) {
      // Checa caminho duplicado
      if (this.declaredPaths.has(route.path)) {
        this.errors.push({
          message: `[Erro Semântico] A rota com caminho '${route.path}' foi declarada duplicada.`,
          line: route.line,
        });
      } else {
        this.declaredPaths.add(route.path);
      }

      // Se for rota protegida, valida as roles e o chunk
      if (!route.isPublic) {
        // Checa se as roles usadas foram declaradas
        for (const role of route.allowedRoles) {
          if (!this.declaredProfiles.has(role)) {
            this.errors.push({
              message: `[Erro Semântico] O perfil '${role}' usado na rota '${route.path}' não foi declarado com 'profile ${role};'.`,
              line: route.line,
            });
          }
        }

        // Checa obrigatoriedade e duplicidade de chunkName
        if (!route.chunkName || route.chunkName.trim() === "") {
          this.errors.push({
            message: `[Erro Semântico] A rota protegida '${route.path}' precisa especificar um nome de CHUNK válido.`,
            line: route.line,
          });
        } else if (this.usedChunkNames.has(route.chunkName)) {
          this.errors.push({
            message: `[Erro Semântico] O nome de chunk '${route.chunkName}' está sendo reutilizado em rotas distintas.`,
            line: route.line,
          });
        } else {
          this.usedChunkNames.add(route.chunkName);
        }
      }
    }

    return this.errors;
  }
}
