# Tipay — Deploy Script (Stellar Testnet)
# Uses Stellar CLI (stellar contract deploy)
#
# Prerequisites:
#   1. Install Stellar CLI: cargo install stellar-cli --features opt
#   2. Generate identity: stellar keys generate --global alice --network testnet --fund
#   3. Or set STELLAR_SECRET_KEY in .env.deploy
#
# Usage:
#   cp .env.deploy.example .env.deploy
#   # edit .env.deploy with your secret key
#   bash deploy.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load env
if [ -f .env.deploy ]; then
  set -a
  source .env.deploy
  set +a
fi

NETWORK="${STELLAR_NETWORK:-testnet}"
SOURCE_IDENTITY="${STELLAR_SOURCE_IDENTITY:-alice}"

echo "==============================================="
echo " Tipay — Deploying to Stellar ${NETWORK}"
echo "==============================================="
echo ""

# Build optimized WASM
echo "📦 Building contract..."
stellar contract build

WASM="target/wasm32-unknown-unknown/release/contracts_soroban.wasm"
if [ ! -f "$WASM" ]; then
  echo "❌ Build failed — WASM not found at $WASM"
  exit 1
fi
echo "✓ WASM built: $WASM"
echo ""

# Deploy
echo "🚀 Deploying to ${NETWORK}..."
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM" \
  --source "$SOURCE_IDENTITY" \
  --network "$NETWORK" \
  2>&1 | tail -1)

if [ -z "$CONTRACT_ID" ]; then
  echo "❌ Deploy failed"
  exit 1
fi

echo ""
echo "==============================================="
echo " ✅ DEPLOYED SUCCESSFULLY"
echo "==============================================="
echo " Contract ID: ${CONTRACT_ID}"
echo " Network:     ${NETWORK}"
echo ""
echo " Next: Update .env.deploy and run:"
echo "   CONTRACT_ID=${CONTRACT_ID} bash initialize.sh"
echo "==============================================="
