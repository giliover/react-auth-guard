#!/usr/bin/env node

import { Command } from "commander";
import { compileCommand } from "./commands/compile.js";
import { initCommand } from "./commands/init.js";
import { secureBuildCommand } from "./commands/secureBuild.js";

const program = new Command();

program
  .name("react-auth")
  .description("CLI de Autenticação Orientada a Perfis para React")
  .version("1.0.0");

program
  .command("init")
  .description("Cria um arquivo de modelo security.auth no diretório atual")
  .option(
    "-f, --filename <filename>",
    "Nome do arquivo de saída",
    "security.auth",
  )
  .action((options) => {
    initCommand(options.filename);
  });

program
  .command("compile")
  .description("Compila o arquivo de DSL (.auth) em componentes React")
  .option("-i, --input <path>", "Arquivo de entrada com a DSL", "security.auth")
  .option(
    "-o, --output <dir>",
    "Diretório de saída para os arquivos gerados",
    "src/routes-rbac",
  )
  .action((options) => {
    compileCommand(options.input, options.output);
  });

program
  .command("secure-build")
  .description(
    "Criptografa os chunks estáticos gerados no build e remove os JS brutos",
  )
  .option(
    "-b, --build-dir <dir>",
    "Diretório dos arquivos estáticos de build",
    "build/static/js",
  )
  .option(
    "-i, --input <path>",
    "Arquivo de política DSL (.auth)",
    "security.auth",
  )
  .action((options) => {
    secureBuildCommand(options.buildDir, options.input);
  });

program.parse(process.argv);
