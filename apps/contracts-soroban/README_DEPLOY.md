# Tipay — Deployment Guide (Stellar Soroban)

## Prerequisites

- Install [Stellar CLI](https://github.com/stellar/stellar-cli):
  ```bash
  cargo install stellar-cli --features opt
  ```
- Create a funded testnet identity:
  ```bash
  stellar keys generate --global alice --network testnet --fund
  ```
- Install [Freighter Wallet](https://freighter.app) browser extension.

## Environment Setup

### `.env.deploy` (contracts directory)

```bash
cp .env.deploy.example .env.deploy
# Edit the values:
#   STELLAR_SOURCE_IDENTITY=your_identity_name
#   TOKEN_SAC_ADDRESS=USDC Stellar Asset Contract address
#   OWNER_ADDRESS=Stellar account that receives 10% fees
```

### `.env.local` (frontend)

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
# Edit:
#   NEXT_PUBLIC_TIPAY_CONTRACT_ID=deployed_contract_id
#   NEXT_PUBLIC_TOKEN_SAC_ADDRESS=USDC SAC address
```

## Deploy Steps

### 1. Build & Deploy Contract

```bash
cd apps/contracts-soroban
bash deploy.sh
```

This will:
- Build the WASM (`stellar contract build`)
- Deploy to testnet (`stellar contract deploy`)
- Output the **Contract ID** (`C...`)

### 2. Initialize Contract

```bash
CONTRACT_ID=C... bash initialize.sh
```

This calls `initialize(owner, token_sac)`. The `owner` is the account that will receive 10% of absentee deposits.

### 3. Add USDC Trustline (Owner)

The owner account needs a USDC trustline to receive fee payouts:

```bash
# Find the USDC asset info from the SAC:
stellar contract invoke \
  --id $TOKEN_SAC_ADDRESS \
  --source $STELLAR_SOURCE_IDENTITY \
  --network testnet \
  -- name

# Add the trustline:
stellar tx new change-trust \
  --source-account $STELLAR_SOURCE_IDENTITY \
  --network testnet \
  --line "USDC:<issuer_address>"
```

Alternatively, use Freighter or Stellar Laboratory to add the trustline manually.

### 4. Update Frontend

```bash
# Set the contract ID in .env.local
NEXT_PUBLIC_TIPAY_CONTRACT_ID=C...
NEXT_PUBLIC_TOKEN_SAC_ADDRESS=C...  # USDC SAC
```

### 5. Verify

```bash
# Check session count (should be 0)
stellar contract invoke \
  --id $CONTRACT_ID \
  --source $STELLAR_SOURCE_IDENTITY \
  --network testnet \
  -- session_count
```

## Network Addresses

### Testnet

| Resource | Address |
|----------|---------|
| RPC | `https://soroban-testnet.stellar.org` |
| Horizon | `https://horizon-testnet.stellar.org` |
| Network Passphrase | `Test SDF Network ; September 2015` |
| Native XLM SAC | `CDMLFMKMMD7MWZP3FKUBZPVEGUJYXKAKHNBYJKPQXKTBBSBKKYRDQ7Y6` |

## Important Notes

- **`initialize` is mandatory** — Without it, the contract can't process deposits.
- **Trustlines are required** — The owner and all participants must have a USDC trustline to send/receive USDC via the SAC.
- **Contract ID changes on each deploy** — Update the frontend `.env.local` after every deploy.
- **WASM path** — The compiled WASM is at `target/wasm32v1-none/release/contracts_soroban.wasm` (note: `wasm32v1-none`, not `wasm32-unknown-unknown`).
