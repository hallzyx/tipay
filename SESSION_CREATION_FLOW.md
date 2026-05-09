# Tipay Session Creation Flow

## Executive Summary

Tipay is a dApp on Stellar Soroban that allows creating **group accountability sessions** where participants deposit USDC as a guarantee of attendance. If someone flakes, they lose their deposit (minus a 10% protocol fee), which is distributed among those who attended.

## Complete Session Lifecycle

### 1. Wallet Connection

**Mandatory initial step**

- The user connects their wallet using Freighter (Stellar browser extension).
- A "CONNECT WALLET" button is in the header.
- The wallet address is displayed in the header as `GBZI...NCCS`.

**State after connection:**
- The USDC balance is fetched from the Stellar Asset Contract and displayed in the wallet dropdown menu.
- The locale (EN/ES) can be toggled in the same dropdown.

### 2. Accessing the Creation Modal

**Location:** "New Session" button on `/sessions` (orange button, top-right).

- Only visible when the wallet is connected.
- Opens a brutalist modal with the session configuration form.

### 3. Session Configuration

#### 3.1 Amount per Participant

**Mandatory field**

- **Type:** Decimal number.
- **Minimum value:** 0.01 USDC.
- **Internal format:** Stroops (1 USDC = 10,000,000 stroops via Stellar SAC).
- **UI:** Numeric input with 0.01 step, label "Amount Per Person (USDC)".

**Considerations:**
- This amount is deposited by each participant.
- If someone flakes, 10% goes to the platform owner, the rest to attendees.

#### 3.2 Event Date & Time

**Mandatory fields**

- **Date:** `date` type input (YYYY-MM-DD).
- **Time:** `time` type input (HH:MM).
- **Internal format:** Unix timestamp (seconds).
- **Label:** "Date" + "Time".

**Validations:**
- The date/time must be in the future.
- Past dates are rejected with an error message.

#### 3.3 Voting Window

**Mandatory field**

- **Type:** Number (minutes).
- **Default:** 60 minutes.
- **Internal format:** Converted to seconds before sending.
- **Label:** "Voting Window (Minutes)".

#### 3.4 Participants

**Mandatory field**

- **Minimum:** 3 total (host + 2 friends).
- **Maximum:** 5 total (host + 4 friends).
- **Format:** Stellar addresses (`G...`).

**Structure:**
- The **host** (creator) is added automatically and labeled "Host".
- Fields to add friends (2–4 fields, "Amigo" placeholder in Spanish).
- "+" button to add a field; "trash" button to remove.

### 4. Transaction Submission

**Action:** "Create Session" / "Crear Sesión" button (localized).

**Parameters sent to the contract:**

```rust
create_session(
    host: Address,              // Creator's Stellar address
    amount: i128,               // Amount in stroops
    deadline: u64,              // Unix timestamp
    voting_period: u64,         // Voting window in seconds
    participants: Vec<Address>, // Array of addresses (3-5)
) -> Result<u64, ContractError>
```

**Transaction flow:**
1. `buildContractTx(address, "create_session", args)` — builds a Soroban tx
2. `rpc.simulateTransaction(tx)` — estimates resources
3. `rpc.assembleTransaction(tx, simulation)` — applies auth + footprint
4. Freighter signs the assembled XDR
5. `rpc.sendTransaction(signedTx)` — submits to network
6. `rpc.getTransaction(hash)` — polls until confirmed

**States during submission:**

| State | UI |
|-------|-----|
| Idle | "Create Session" (or "Crear Sesión") |
| Building | "Building…" |
| Signing | "Sign in Wallet…" |
| Submitting | "On Chain…" |
| Success | "✓ Created!" → closes after 1.5s |
| Error | Red banner with error message |

**Post-creation events:**
- `triggerBalanceRefresh()` — refreshes USDC balance in header
- `triggerSessionRefresh()` — refreshes session list on dashboard
- `onSuccess` callback — increments `refreshKey`

### 5. Session States

| State | Condition | Description |
|-------|-----------|-------------|
| **WAITING** | `active = false` | Not all participants have deposited yet |
| **ACTIVE** | `active = true` | All deposits received, waiting for deadline |
| **VOTING** | `now >= deadline && now < deadline + voting_period` | Voting window open |
| **CLOSED** | `now >= deadline + voting_period && !finalized` | Voting closed, ready to finalize |
| **REFUNDED** | `finalized = true, not all deposited` | Not all deposited → refunds issued |
| **FINALIZED** | `finalized = true` | Absentee pool distributed (10% fee paid) |

### 6. Deposit

**Location:** Session detail page (`/session/[id]`)

**Flow:**
1. Participant navigates to session
2. `DepositButton` checks `has_deposited(sessionId, address)`
3. If not yet deposited: shows "Deposit" / "Depositar" button
4. On click: `deposit(from, sessionId)` — single-step USDC transfer via SAC
5. No separate approve needed (unlike ERC-20 tokens)
6. On success: `triggerBalanceRefresh()` updates header balance

**Validations (contract-side):**
- Must be a participant
- Must not have already deposited
- Session must not be finalized
- Deadline must not have passed

### 7. Voting

**Location:** Session detail page (appears during voting window)

**Flow:**
1. After `deadline`, each participant votes for who was absent
2. `cast_vote(voter, session_id, absent)` — one vote per participant
3. Cannot vote for yourself (contract enforces `CannotVoteSelf`)
4. Majority rule: threshold = `(voter_count / 2) + 1`
5. Non-voters are auto-marked as absent

**UI:**
- "Cast Vote" / "Votar" button
- Countdown timer showing remaining voting time
- "Vote Cast" / "Voto Emitido" after voting

### 8. Finalization & Distribution

**Trigger:** Anyone can call "Resolve Session" / "Resolver Sesión" after voting closes.

**Distribution logic:**

```
if not all deposited:
    each depositor gets refunded
else:
    determine absentees and attendees via votes
    if no absentees:
        everyone gets refunded
    if absentees exist:
        absentee_pool = amount × absentee_count
        owner_fee = absentee_pool × 10 / 100
        attendee_bonus = (absentee_pool - owner_fee) / attendee_count
        each attendee receives: their_deposit + attendee_bonus
        owner receives: owner_fee (needs USDC trustline!)
```

## Trustline Requirement

To receive USDC on Stellar, an account **must** have a trustline for the asset:

- **Owner account**: Must have trustline `USDC:<issuer>` to receive 10% fees.
- **Participants**: Must have trustline before depositing.
- **Attendees**: Must have trustline to receive refunds/bonuses.

Without a trustline, the transfer will fail with: `"trustline entry is missing for account"`.

## Error States

### Validation Errors (frontend)

| Message | Key | When |
|---------|-----|------|
| "Connect your wallet first" | `modal.error.connectWallet` | Wallet not connected |
| "Enter an amount greater than 0" | `modal.error.amount` | Invalid amount |
| "Set a date and time for the event" | `modal.error.date` | Missing date/time |
| "The event must be in the future" | `modal.error.future` | Past date |
| "You need at least 2 more friends (3 total)" | `modal.error.minFriends` | < 3 participants |
| "Maximum 5 participants total" | `modal.error.maxFriends` | > 5 participants |

### Contract Errors

| Error | Code | When |
|-------|------|------|
| AlreadyInitialized | 1 | Calling `initialize` twice |
| NotParticipant | 2 | Non-participant tries to deposit/vote |
| AlreadyDeposited | 3 | Double deposit |
| DeadlineReached | 5 | Deposit after deadline |
| AlreadyFinalized | 6 | Session already finalized |
| NotEnoughParticipants | 7 | < 3 participants on creation |
| TooManyParticipants | 8 | > 5 participants on creation |
| TransferFailed | 9 | USDC transfer fails (trustline?) |
| AlreadyVoted | 10 | Double vote |
| InvalidAbsent | 11 | Voting for non-participant |
| VotingNotOpen | 13 | Vote before deadline |
| VotingClosed | 14 | Vote after voting period |
| SessionNotActive | 15 | Vote in inactive session |
| CannotVoteSelf | 16 | Voting for yourself |
| NotInitialized | 17 | Contract not initialized |
| SessionNotFound | 18 | Invalid session ID |

## UI / UX

### Design System

- **Vanguard Brutalist Terminal**: hard shadows, 2px black borders, zero border-radius.
- **Color palette**: Stark White (`#F9F9F9`), Absolute Black (`#000000`), Industrial Orange (`#D73B19`).
- **Typography**: Space Grotesk (masive uppercase titles, tight leading).
- **Grid**: Subtle 40px background grid pattern.
- **Animations**: Fast transitions (75–100ms), "press" effect on button click.

### I18n

All user-facing text is available in English and Spanish. Locale can be toggled in the header wallet dropdown. The locale is detected from `navigator.language` on first visit and persisted in `localStorage`.
