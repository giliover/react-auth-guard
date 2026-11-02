export interface ASTNode {
  type: string;
}

export interface ProfileNode extends ASTNode {
  type: "Profile";
  name: string;
  line: number;
}

export interface RouteNode extends ASTNode {
  type: "Route";
  path: string;
  isPublic: boolean;
  allowedRoles: string[];
  chunkName?: string;
  line: number;
}

export interface ProgramNode extends ASTNode {
  type: "Program";
  profiles: ProfileNode[];
  routes: RouteNode[];
}
