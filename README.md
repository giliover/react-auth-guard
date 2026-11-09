# Integrating `@react-auth` into a React Application (CRA)

This guide walks you through creating a React application from scratch using **Create React App (CRA)** and integrating the security framework locally through the `/dist` directories, without publishing it to NPM.

---

## 1. Create the React Application

Inside the `examples/` directory, create a React application using Create React App with TypeScript and install `react-router-dom`:

```bash
cd examples
npx create-react-app app-cli --template typescript
cd app-cli
npm install react-router-dom

```

---

## 2. Import the Library Through `package.json`

Edit `examples/app-cli/package.json` to configure the relative dependencies and the new CLI scripts:

```json
{
  "name": "app-cli",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    // Other lines
    "@react-auth/core-runtime": "file:../../packages/core-runtime", // Add this line
  },
  "devDependencies": {
    // Other lines
    "@react-auth/cli": "file:../../packages/cli" // Add this line
  },
  "scripts": {
    // Other lines
    "auth:compile": "react-auth compile", // Add this line
    "auth:build": "react-auth build", // Add this line
    "auth:install": "react-auth install", // Add this line
    "auth:start": "react-auth start", // Add this line
    "build": "npm run auth:compile && react-scripts build && npm run auth:build" // Add this line
  }
}
```

Install local packages:

```bash
npm install

```

---

## 3. Define the Security Policy (`security.auth`)


At the root of the `app-cli` project, create a `security.auth` file:

```bash
npm run auth:init

```

---

## 4. Examples of Application Pages (`src/modules/`)

### `src/modules/Login.tsx`

```tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@react-auth/core-runtime";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginAdmin = () => {
    const token = "TOKEN_JWT";

    login(token, ["ADMIN"]);
    navigate("/admin");
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleLoginAdmin}>Sign in as Admin</button>
    </div>
  );
}
```

### `src/modules/Dashboard.tsx`

```tsx
import React from "react";

export default function Dashboard() {
  return <h1>User Dashboard</h1>;
}
```

### `src/modules/Admin.tsx`

```tsx
import React from "react";

export default function Admin() {
  return <h1>Protected Administration Panel</h1>;
}
```

---

## 5. Generate Route Artifacts

Run the compiler to generate frontend dynamic routes in `src/route-rbac/`:

```bash
npm run auth:compile

```

---

## 6. Connect the Router (`src/App.tsx`)

Replace the contents of `src/App.tsx` with:

```tsx
import React from "react";
import { AuthProvider } from "@react-auth/core-runtime";
import { AppRoutes } from "./route-rbac/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
```

---

## 7. Build and Run the RBAC Infrastructure

### 1. Build Protected Chunks & Server Artifacts

```bash
npm run auth:build

```

Generates the `server/` directory containing:

- `server/protected-chunks/*.js`: Bundled ESM modules.
- `server/index.js`: Express server with RBAC middleware.
- `server/package.json`: Server manifest.

### 2. Install Server Dependencies

```bash
npm run auth:install

```

Executes `npm install` inside the generated `server/` folder.

### 3. Start the RBAC Server

```bash
npm run auth:start

```

Runs the server on `http://localhost:4000`.

### 4. Run Frontend React App

```bash
npm start

```
