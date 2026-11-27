#!/usr/bin/env bash
# Despliega DOS instancias de Muro en testnet y escribe web/src/deployed.json.
#   demo: day_secs=60,    grace_days=1  ("1 día = 1 minuto" para demos en vivo)
#   real: day_secs=86400, grace_days=7
#
# Requisitos: rust + stellar CLI. Crea (si faltan) las identidades muro-admin, muro-artist,
# muro-venue y muro-guest con friendbot. Token = XLM nativo (SAC).
#
# Uso: scripts/deploy-testnet.sh
# Es "casi idempotente": reutiliza identidades y compila de nuevo, pero cada ejecución
# despliega instancias NUEVAS y sobrescribe deployed.json (el estado viejo queda huérfano).
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

cd "$ROOT"
for k in admin artist venue guest; do ensure_key "muro-$k"; done

echo "==> Compilando"
stellar contract build >/dev/null
[ -f "$WASM" ] || { echo "no se encontró $WASM" >&2; exit 1; }

TOKEN="$(stellar contract id asset --asset native --network "$NETWORK")"
echo "token (XLM SAC): $TOKEN"

# El SAC nativo ya existe en testnet; por las dudas, intentamos desplegarlo (falla si ya está).
stellar contract asset deploy --asset native --source muro-admin --network "$NETWORK" >/dev/null 2>&1 || true

echo "==> Subiendo wasm"
WASM_HASH="$(retry stellar contract upload --wasm "$WASM" --source muro-admin --network "$NETWORK" 2>/dev/null | tail -1)"
echo "wasm hash: $WASM_HASH"

# deploy_one <nombre> <day_secs> <grace_days>  -> imprime "contractId deployTx"
deploy_one() {
  local name="$1" day="$2" grace="$3" log cid tx
  log="$(mktemp)"
  cid="$(retry stellar contract deploy --wasm-hash "$WASM_HASH" --source muro-admin \
    --network "$NETWORK" -- --token "$TOKEN" --day_secs "$day" --grace_days "$grace" 2>"$log" | tail -1)" \
    || { cat "$log" >&2; return 1; }
  tx="$(tx_hash_from_log "$log" || true)"
  rm -f "$log"
  echo "$cid $tx"
}

echo "==> Desplegando demo"
read -r DEMO_ID DEMO_TX < <(deploy_one demo 60 1)
echo "demo: $DEMO_ID ($DEMO_TX)"
echo "==> Desplegando real"
read -r REAL_ID REAL_TX < <(deploy_one real 86400 7)
echo "real: $REAL_ID ($REAL_TX)"

mkdir -p "$(dirname "$DEPLOYED_JSON")"
cat > "$DEPLOYED_JSON" <<JSON
{
  "network": "$NETWORK",
  "rpcUrl": "$RPC_URL",
  "networkPassphrase": "$PASSPHRASE",
  "token": "$TOKEN",
  "instances": {
    "demo": { "contractId": "$DEMO_ID", "daySecs": 60, "graceDays": 1, "deployTx": "$DEMO_TX" },
    "real": { "contractId": "$REAL_ID", "daySecs": 86400, "graceDays": 7, "deployTx": "$REAL_TX" }
  }
}
JSON
echo "==> Escrito $DEPLOYED_JSON"
