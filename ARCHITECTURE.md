# Tipay Architecture

## Overview

Tipay is a pnpm monorepo that integrates a **Rust-based Soroban smart contract** (Stellar) with a **Next.js 15 frontend**. The dApp enables group accountability sessions where participants deposit USDC, vote on absentees, and earn rewards — with a 10% protocol fee for the contract owner.

## Components

### 1. Smart Contract (`apps/contracts-soroban`)

- **Language**: Rust (`soroban-sdk v25.0.1`)
- **Token**: USDC via Stellar Asset Contract (SAC)
- **Storage**: `instance` for config + `persistent` for session data, with 30-day TTL

#### Public Functions

| Function | Description |
|----------|-------------|
| `initialize(owner, token_sac)` | One-time setup after deploy. Stores owner (fee recipient) and USDC SAC address. |
| `create_session(...)` | Creates session. Sets NextSessionId + stores Session struct + participants. |
| `deposit(from, session_id)` | Single-step USDC transfer via `token::Client::transfer()`. No approve needed. |
| `cast_vote(voter, session_id, absent)` | Records a vote during the voting window `[deadline, deadline+voting_period)`. |
| `finalize_session(session_id)` | Resolution: refunds or distributes with 10% fee to owner. |
| `get_session(session_id)` | Returns session metadata. |
| `get_participant(session_id, index)` | Returns participant address by index. |
| `has_deposited(session_id, addr)` | Deposit status check. |
| `has_voted(session_id, addr)` | Vote status check. |
| `absence_vote_count(session_id, addr)` | Number of votes against a participant. |
| `voting_deadline(session_id)` | `deadline + voting_period`. |
| `session_count()` | Total sessions created. |
| `token_sac_address()` | Return the USDC SAC address. |

#### Finalization Logic (10% fee)

```
if not all deposited → refund depositors
if all deposited:
  determine absentees / attendees via majority vote
  if no absentees → refund all
  if absentees exist:
    absentee_pool = amount × absentee_count
    fee = absentee_pool × 10 / 100  → owner
    bonus_pool = absentee_pool × 90 / 100 → split among attendees
    each attendee receives: their own deposit + bonus_pool / attendee_count
```

#### Errors (`ContractError`)

| Code | Variant |
|------|---------|
| 1 | AlreadyInitialized |
| 2 | NotParticipant |
| 3 | AlreadyDeposited |
| 4 | DeadlineNotReached |
| 5 | DeadlineReached |
| 6 | AlreadyFinalized |
| 7 | NotEnoughParticipants |
| 8 | TooManyParticipants |
| 9 | TransferFailed |
| 10 | AlreadyVoted |
| 11 | InvalidAbsent |
| 12 | NotAllDeposited |
| 13 | VotingNotOpen |
| 14 | VotingClosed |
| 15 | SessionNotActive |
| 16 | CannotVoteSelf |
| 17 | NotInitialized |
| 18 | SessionNotFound |

#### Events

- `SessionCreatedEvent` — emitted on `create_session`
- `DepositedEvent` — emitted on `deposit`
- `VoteCastEvent` — emitted on `cast_vote`
- `FinalizedEvent` — emitted on successful `finalize_session`
- `RefundedEvent` — emitted when not all deposited and session refunds

### 2. Frontend (`apps/frontend`)

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 — "Vanguard Brutalist Terminal" design system
- **Design**: Hard shadows (`shadow-hard`), 2px borders, zero border-radius, Space Grotesk font
- **Chain Interaction**: `@stellar/stellar-sdk` (simulate + assemble + submit pattern)
- **Wallet**: `@stellar/freighter-api` v6
- **I18n**: Built-in EN/ES via React context (`contexts/language.tsx`)

#### Key Files

| Path | Role |
|------|------|
| `src/lib/contract.ts` | Build tx → simulate → assemble XDR for writes; simulate reads |
| `src/lib/stellar.ts` | RPC singleton, network config, env var bindings |
| `src/lib/utils.ts` | `shortAddress`, `formatStroops`, `amountToStroops` |
| `src/hooks/useContract.ts` | Typed write/read hooks + helpers for each contract function |
| `src/hooks/useFreighter.ts` | Freighter connect / sign / disconnect |
| `src/hooks/useTokenBalance.ts` | Fetches USDC balance via SAC `balance()` simulation |
| `src/contexts/refresh.tsx` | Cross-component refresh triggers (balanceKey, sessionKey) |
| `src/contexts/language.tsx` | `LanguageProvider` + `useLanguage()` for i18n |
| `src/lib/i18n.ts` | EN/ES dictionary (130+ keys) |

## Key Flows

### Write Flow (e.g., deposit)

1. `buildContractTx(address, method, args)` — builds tx, simulates via RPC, assembles
2. `sign(xdr)` — user signs with Freighter
3. `sendTransaction(tx) + getTransaction(hash)` — submits & polls until confirmed
4. On success: triggers `triggerBalanceRefresh()` from `RefreshContext`

### Read Flow (e.g., get_session)

1. `simulateRead(method, args, sourceAddress?)` — builds tx with dummy/real source, simulates via RPC
2. `scValToNative(retval)` — decodes the ScVal return value
3. Helper functions like `getSession(readFn, id)` wrap this with typed return values

### i18n

- Detects browser locale (`navigator.language`) on mount
- Saves preference to `localStorage` under `tipay-locale`
- Fallback: English for any non-Spanish locale
- Toggle button in header dropdown (EN/ES)
- All user-facing text uses `t("key")` from `useLanguage()`

### USDC Balance

- `useTokenBalance(address, sacAddress, refreshKey)` hook
- Calls SAC's `balance(id)` function via simulation
- Refetches when `refreshKey` increments (after deposit / session create / finalize / manual refresh)

## Trustline Requirements

For an account to hold or receive USDC (or any non-native Stellar asset), it must have a **trustline** for that asset. In Tipay:
- The **owner** (fee recipient) needs a trustline for the USDC asset
- **Participants** need a USDC trustline to deposit
- **Attendees** need a USDC trustline to receive refunds/bonuses

## Directory Structure

```
apps/frontend/src/
├── app/
│   ├── layout.tsx              # Root layout (Header + Providers)
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Base styles + utilities + grid pattern
│   ├── sessions/
│   │   └── page.tsx            # Dashboard — session grid
│   └── session/
│       └── [id]/
│           └── page.tsx        # Session detail
├── components/
│   ├── Header.tsx              # Navigation + wallet + balance + locale
│   ├── providers.tsx           # Context wrappers
│   ├── CreateSessionModal.tsx  # Session creation form
│   ├── DepositButton.tsx       # USDC deposit
│   ├── VotePanel.tsx           # Absentee voting
│   ├── StatusBadge.tsx         # WAITING / ACTIVE / VOTING / etc.
│   └── SessionCard.tsx         # Dashboard grid card
├── contexts/
│   ├── refresh.tsx             # Refresh triggers
│   └── language.tsx            # i18n provider
├── hooks/
│   ├── useFreighter.ts         # Wallet connection
│   ├── useContract.ts          # Contract read/write helpers
│   └── useTokenBalance.ts      # USDC balance fetcher
└── lib/
    ├── contract.ts             # Tx building + ScVal encoding
    ├── stellar.ts              # Network config + RPC singleton
    ├── utils.ts                # Formatting helpers
    └── i18n.ts                 # EN/ES dictionary
```
