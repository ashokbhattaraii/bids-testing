# BIDS – HamroLifeBank

Turborepo monorepo for the HamroLifeBank platform.

## Structure

```
apps/
  web/   → Next.js frontend
  api/   → NestJS backend
```

## Prerequisites

- Node.js ≥ 18
- pnpm 9+

## Getting Started

```bash
# Install dependencies
pnpm install

# Run all apps in dev mode
pnpm dev
```

- **Web** → http://localhost:3000
- **API** → http://localhost:3001

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `pnpm dev`     | Start all apps (dev)     |
| `pnpm build`   | Build all apps           |
| `pnpm lint`    | Lint all apps            |
| `pnpm clean`   | Clean build artifacts    |
