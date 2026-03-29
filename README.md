# Zoop

Mobile-first grid game on [Base](https://base.org) with daily on-chain check-in.

**Live:** [zoop-pi.vercel.app](https://zoop-pi.vercel.app)

## Structure

- `web/` — Next.js app (Vercel root directory)
- `contracts/` — Foundry: `ZoopCheckIn`

## Quick start

```bash
cd web && npm install && npm run dev
```

Copy `web/.env.example` to `web/.env.local` and set `NEXT_PUBLIC_*` variables.

## Contracts

```bash
cd contracts && forge test
```

Deploy with `forge script` (set `PRIVATE_KEY` and RPC URL). Do not commit keys or `.env.local`.
