import { Token, TokenType, KEYWORDS } from "./tokens.js";

export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(input: string) {
    this.input = input;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.position < this.input.length) {
      const currentChar = this.input[this.position];

      // 1. Ignorar espaços em branco e tabulações
      if (currentChar === " " || currentChar === "\t" || currentChar === "\r") {
        this.advance();
        continue;
      }

      // 2. Controlar quebra de linha
      if (currentChar === "\n") {
        this.line++;
        this.position++;
        this.column = 1;
        continue;
      }

      // 3. Ignorar comentários de linha iniciando com # ou //
      if (currentChar === "#" || (currentChar === "/" && this.peek() === "/")) {
        this.skipLineComment();
        continue;
      }

      // 4. Símbolos de 1 caractere
      if (currentChar === ";") {
        tokens.push(this.makeToken(TokenType.TOK_SEMI, ";"));
        this.advance();
        continue;
      }
      if (currentChar === "[") {
        tokens.push(this.makeToken(TokenType.TOK_LBRACKET, "["));
        this.advance();
        continue;
      }
      if (currentChar === "]") {
        tokens.push(this.makeToken(TokenType.TOK_RBRACKET, "]"));
        this.advance();
        continue;
      }
      if (currentChar === ",") {
        tokens.push(this.makeToken(TokenType.TOK_COMMA, ","));
        this.advance();
        continue;
      }

      // 5. Strings delimitadas por aspas duplas ("...")
      if (currentChar === '"') {
        tokens.push(this.readString());
        continue;
      }

      // 6. Identificadores e Palavras-chave ([a-zA-Z_][a-zA-Z0-9_-]*)
      if (this.isAlpha(currentChar)) {
        tokens.push(this.readIdentifier());
        continue;
      }

      // Erro Léxico: Caractere desconhecido
      throw new Error(
        `[Erro Léxico] Caractere inesperado '${currentChar}' na linha ${this.line}, coluna ${this.column}`,
      );
    }

    tokens.push(this.makeToken(TokenType.TOK_EOF, ""));
    return tokens;
  }

  private advance(): void {
    this.position++;
    this.column++;
  }

  private peek(): string | null {
    return this.position + 1 < this.input.length
      ? this.input[this.position + 1]
      : null;
  }

  private makeToken(type: TokenType, value: string): Token {
    return {
      type,
      value,
      line: this.line,
      column: this.column,
    };
  }

  private isAlpha(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return /[a-zA-Z0-9_\-]/.test(char);
  }

  private readString(): Token {
    const startLine = this.line;
    const startColumn = this.column;
    this.advance(); // Pula as aspas de abertura

    let value = "";

    while (
      this.position < this.input.length &&
      this.input[this.position] !== '"'
    ) {
      if (this.input[this.position] === "\n") {
        throw new Error(
          `[Erro Léxico] String não encerrada na linha ${startLine}, coluna ${startColumn}`,
        );
      }
      value += this.input[this.position];
      this.advance();
    }

    if (this.position >= this.input.length) {
      throw new Error(
        `[Erro Léxico] String não encerrada no fim do arquivo. Início na linha ${startLine}, coluna ${startColumn}`,
      );
    }

    this.advance(); // Pula as aspas de fechamento

    return {
      type: TokenType.TOK_STRING,
      value,
      line: startLine,
      column: startColumn,
    };
  }

  private readIdentifier(): Token {
    const startLine = this.line;
    const startColumn = this.column;
    let value = "";

    while (
      this.position < this.input.length &&
      this.isAlphaNumeric(this.input[this.position])
    ) {
      value += this.input[this.position];
      this.advance();
    }

    // Verifica se a palavra lida é uma palavra-chave ou um identificador comum
    const type = KEYWORDS[value] || TokenType.TOK_ID;

    return {
      type,
      value,
      line: startLine,
      column: startColumn,
    };
  }

  private skipLineComment(): void {
    while (
      this.position < this.input.length &&
      this.input[this.position] !== "\n"
    ) {
      this.position++;
    }
  }
}
