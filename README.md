# X-Login-Onboarding

Monorepo React TypeScript (client) + Backend (server) + Redis.

## Installation

```bash
npm install
```

## Scripts

```bash
npm run dev          # Client
npm run dev:server   # Server
npm run dev:redis    # Redis
npm run dev:all      # Client + Server + Redis
npm run build        # Build tout
```

## Alias

**Client** : `@components`, `@pages`, `@hooks`, `@utils`, `@types`, `@assets`, `@styles`, `@services`, `@context`

**Server** : `@routes`, `@controllers`, `@models`, `@middleware`, `@utils`, `@types`, `@config`

```typescript
// Exemple
import { Button } from "@components/Button";
import { UserController } from "@controllers/UserController";
```
