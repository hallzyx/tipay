# Tipay — Initialize Script
# Calls initialize(owner, token_sac) on the deployed contract.
#
# Prerequisites:
#   1. Contract deployed (CONTRACT_ID set)
#   2. Stellar CLI installed
#
# Usage:
#   TOKEN_SAC_ADDRESS=C... CONTRACT_ID=C... bash initialize.sh
#   # or set TOKEN_SAC_ADDRESS and CONTRACT_ID in .env.deploy

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
CONTRACT_ID="${CONTRACT_ID:-}"
TOKEN_SAC_ADDRESS="${TOKEN_SAC_ADDRESS:-}"

if [ -z "$CONTRACT_ID" ]; then
  echo "❌ CONTRACT_ID not set."
  echo "   Run: CONTRACT_ID=C... bash initialize.sh"
  exit 1
fi

if [ -z "$TOKEN_SAC_ADDRESS" ]; then
  echo "❌ TOKEN_SAC_ADDRESS not set."
  echo "   For native XLM on testnet use:"
  echo "   TOKEN_SAC_ADDRESS=CDMLFMKMMD7MWZP3FKUBZPVEGUJYXKAKHNBYJKPQXKTBBSBKKYRDQ7Y6"
  exit 1
fi

echo "==============================================="
echo " Tipay — Initializing Contract"
echo "==============================================="
echo " Contract ID:  ${CONTRACT_ID}"
echo " Network:      ${NETWORK}"
echo " Owner:        ${SOURCE_IDENTITY}"
echo " Token SAC:    ${TOKEN_SAC_ADDRESS}"
echo ""

echo "🔧 Calling initialize(owner, token_sac)..."
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source "$SOURCE_IDENTITY" \
  --network "$NETWORK" \
  -- \
  initialize \
  --owner "$SOURCE_IDENTITY" \
  --token_sac "$TOKEN_SAC_ADDRESS"

echo ""
echo "==============================================="
echo " ✅ INITIALIZED SUCCESSFULLY"
echo "==============================================="
echo ""
echo " Ready to use! Frontend needs:"
echo "   NEXT_PUBLIC_TIPAY_CONTRACT_ID=${CONTRACT_ID}"
echo "==============================================="
