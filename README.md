# Tipay

> _Did you say you were coming? Then show up — or lose your deposit._

Tipay is a **dApp on Stellar Soroban** that penalizes friends who flake on agreed-upon meetups with **USDC**.

---

## 📑 Table of Contents

- [Stack](#stack)
- [Project Structure](#project-structure)
- [User Flow](#user-flow)
- [Routes](#routes)
- [I18n](#i18n)
- [Quick Start](#quick-start)
- [Networks](#networks)
- [Documentation Index](#documentation-index)
- [Resources](#resources)

---

## Stack

| Layer             | Tool                                        |
| ----------------- | ------------------------------------------- |
| Smart contracts   | Rust + Soroban SDK v25.0.1                  |
| Network           | Stellar Testnet                             |
| Frontend          | Next.js 15 + React 19                       |
| Chain interaction | @stellar/stellar-sdk + @stellar/freighter-api |
| Styling           | Tailwind CSS v4                             |
| Icons             | lucide-react                                |
| Package manager   | pnpm                                        |

## Project Structure

```
tipay/
├── apps/
│   ├── contracts-soroban/   # Rust Contracts (Soroban SDK)
│   └── frontend/            # Next.js 15 App Router
├── pnpm-workspace.yaml
└── package.json
```

## User Flow

1. **Create Session** — The host defines: amount per person (USDC), deadline, voting window, and participants (3–5).
2. **Deposit** — Each participant deposits the amount into the contract (single-step, no separate approve needed on Stellar).
3. **Vote Absentees** — After the deadline, participants vote on who didn't show up.
4. **Finalize** — Anyone can resolve the session. 10% of the absentee pool goes to the contract owner (fabricante); the remaining 90% is split among attendees.

## Routes

| Route              | Description                      |
| ------------------ | -------------------------------- |
| `/`                | Landing page                     |
| `/sessions`        | Dashboard — session list + stats |
| `/session/[id]`    | Session detail — deposit, vote, finalize |

## I18n

Tipay supports English and Spanish. The locale is detected from the browser automatically and can be toggled via the wallet dropdown menu in the header.

## Documentation Index

| # | Document | Covers | For Whom |
|---|----------|--------|----------|
| 1 | **[Architecture](ARCHITECTURE.md)** | Contract functions, frontend architecture, read/write flows, directory tree, trustline requirements, error table, events | Developers |
| 2 | **[Session Creation Flow](SESSION_CREATION_FLOW.md)** | Full lifecycle from wallet connect → create → deposit → vote → finalize, UI states, validation errors, contract errors, design system | Developers & QA |
| 3 | **[Product Report](TIPAY_PRODUCT_REPORT.md)** | Non-technical executive summary, problem definition, market opportunity, innovation, differentiation, recommendations | Stakeholders & investors |
| 4 | **[Deployment Guide](apps/contracts-soroban/README_DEPLOY.md)** | Prerequisites, step-by-step deploy, initialize, trustline setup, verification, network addresses | DevOps & contributors |

### Quick Reference

| Want to… | Start here |
|----------|------------|
| Understand the smart contract | [`ARCHITECTURE.md`](ARCHITECTURE.md) — contract functions, errors, events |
| Set up a dev environment | [`README_DEPLOY.md`](apps/contracts-soroban/README_DEPLOY.md) — deploy, initialize, trustlines |
| Follow the user journey | [`SESSION_CREATION_FLOW.md`](SESSION_CREATION_FLOW.md) — step-by-step with UI states |
| Read the pitch | [`TIPAY_PRODUCT_REPORT.md`](TIPAY_PRODUCT_REPORT.md) — executive summary |
| Browse the frontend code | [`ARCHITECTURE.md`](ARCHITECTURE.md) — key files table, directory structure |
| Debug contract errors | [`SESSION_CREATION_FLOW.md`](SESSION_CREATION_FLOW.md) — error tables with codes |

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment variables
cp apps/frontend/.env.example apps/frontend/.env.local

# 3. Build & deploy contract to testnet
cd apps/contracts-soroban
bash deploy.sh

# 4. Initialize the contract (mandatory)
#    Set TOKEN_SAC_ADDRESS and OWNER_ADDRESS in .env.deploy first
CONTRACT_ID=C... bash initialize.sh

# 5. Update frontend .env.local with the contract ID
#    NEXT_PUBLIC_TIPAY_CONTRACT_ID=C...

# 6. (Optional) Add a USDC trustline for the owner
#    stellar trustline add --asset "USDC:<issuer>" --source <identity> --network testnet

# 7. Start the frontend
pnpm dev
```

> **⚠️ Important:** Step 4 (`initialize`) is **mandatory** after every deploy. Without it, the contract can't process deposits.

## Networks

| Network         | RPC                                              |
| --------------- | ------------------------------------------------ |
| Stellar Testnet | <https://soroban-testnet.stellar.org>            |
| Stellar Mainnet | <https://mainnet.sorobanrpc.com>                 |

## Resources

- [Soroban Docs](https://soroban.stellar.org/docs)
- [Stellar Expert](https://stellar.expert)
- [Freighter Wallet](https://freighter.app)
