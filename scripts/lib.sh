#!/usr/bin/env bash
# Funciones compartidas por deploy-testnet.sh y seed-testnet.sh.
set -euo pipefail

NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
PASSPHRASE="Test SDF Network ; September 2015"
EXPLORER="https://stellar.expert/explorer/testnet"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOYED_JSON="$ROOT/web/src/deployed.json"
WASM="$ROOT/target/wasm32v1-none/release/muro.wasm"
XLM=10000000 # 1 XLM = 10^7 stroops (7 decimales)

# Reintenta un comando hasta 4 veces (la red de testnet falla de forma intermitente).
retry() {
  local n=0
  until "$@"; do
    n=$((n + 1))
    [ "$n" -ge 4 ] && return 1
    echo "  reintento $n..." >&2
    sleep $((n * 3))
  done
}

# Crea (y fondea con friendbot) la identidad si no existe.
ensure_key() {
  if ! stellar keys address "$1" >/dev/null 2>&1; then
    retry stellar keys generate "$1" --fund --network "$NETWORK"
  fi
}

# Extrae el hash de una transacción del log del CLI (URL de stellar.expert en stderr).
tx_hash_from_log() {
  grep -Eo 'tx/[0-9a-f]{64}' "$1" | tail -1 | cut -d/ -f2
}

# invoke <source> <contract_id> <fn> [args...]
# Imprime el resultado en stdout. Como suele llamarse dentro de $(...) (subshell), el hash
# de la última tx se guarda en un archivo; leerlo con `last_tx`.
LAST_TX_FILE="$(mktemp)"
last_tx() { cat "$LAST_TX_FILE"; }
invoke() {
  local src="$1" cid="$2" fn="$3"
  shift 3
  local log out
  log="$(mktemp)"
  out="$(retry stellar contract invoke --id "$cid" --source "$src" --network "$NETWORK" \
    -- "$fn" "$@" 2>"$log")" || { cat "$log" >&2; rm -f "$log"; return 1; }
  tx_hash_from_log "$log" >"$LAST_TX_FILE" || : >"$LAST_TX_FILE"
  rm -f "$log"
  printf '%s\n' "$out"
}

# Solo simula (lecturas): no envía tx.
view() {
  local src="$1" cid="$2" fn="$3"
  shift 3
  retry stellar contract invoke --id "$cid" --source "$src" --network "$NETWORK" \
    --send=no -- "$fn" "$@" 2>/dev/null
}
