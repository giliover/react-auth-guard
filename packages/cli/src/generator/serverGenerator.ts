// packages/cli/src/generator/serverGenerator.ts
import { ProgramNode } from "../parser/ast.js";

export class ServerGenerator {
  private ast: ProgramNode;

  constructor(ast: ProgramNode) {
    this.ast = ast;
  }

  public generateServerCode(): string {
    const permissionsMap: Record<string, string[]> = {};

    this.ast.routes.forEach((route) => {
      if (!route.isPublic && route.chunkName) {
        permissionsMap[route.chunkName] = route.allowedRoles;
      }
    });

    return `// ============================================================================
// ARQUIVO GERADO AUTOMATICAMENTE VIA @react-auth/cli - NÃO EDITAR DIRETA MENTE
// ============================================================================

const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_super_seguro';

// Tabela de permissões RBAC sincronizada com a DSL
const CHUNK_PERMISSIONS = ${JSON.stringify(permissionsMap, null, 2)};
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ["GET", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Endpoint de entrega autenticada de Chunks
app.get('/api/secure-chunks/:chunkName.js', (req, res) => {
  const { chunkName } = req.params;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const allowedRoles = CHUNK_PERMISSIONS[chunkName];

    if (!allowedRoles) {
      return res.status(404).json({ error: 'Módulo não encontrado.' });
    }

    const userRoles = decoded.roles || [];
    const hasRole = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ error: 'Acesso negado a este módulo.' });
    }

    const filePath = path.resolve(__dirname, 'protected-chunks', \`\${chunkName}.js\`);
    res.setHeader('Content-Type', 'application/javascript');
    return res.sendFile(filePath);
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
});

app.listen(PORT, () => {
  console.log(\`🛡️ Servidor RBAC rodando na porta \${PORT}\`);
});
`;
  }

  public generatePackageJson(): string {
    const pkg = {
      name: "rbac-server",
      version: "1.0.0",
      description:
        "Servidor RBAC auto-gerado para entrega segura de chunks ESM",
      main: "index.js",
      scripts: {
        start: "node index.js",
      },
      dependencies: {
        cors: "^2.8.6",
        express: "^5.3.0",
        jsonwebtoken: "^9.0.3",
      },
    };

    return JSON.stringify(pkg, null, 2);
  }
}
