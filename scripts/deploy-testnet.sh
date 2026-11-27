#!/usr/bin/env bash
# Despliega el contrato `sello` en Stellar testnet y escribe web/.env.local.
#
# - Si web/.env.local ya tiene ASSOCIATION_SECRET, reutiliza esa cuenta; si no,
#   genera una nueva y la fondea con friendbot.
# - Compila, despliega (constructor: admin, base_uri, name, symbol) y escribe o
#   actualiza en web/.env.local: STELLAR_RPC_URL, STELLAR_NETWORK_PASSPHRASE,
#   SELLO_CONTRACT_ID, ASSOCIATION_SECRET, ASSOCIATION_PUBLIC, PUBLIC_BASE_URL y
#   PANEL_PASSWORD (esta última solo si no existe). Preserva el resto de claves.
#
# Uso (Git Bash / Linux): scripts/deploy-testnet.sh
#   PUBLIC_BASE_URL=https://mi-dominio scripts/deploy-testnet.sh
source "$(dirname "$0")/_docker.sh"

ENV_FILE="$REPO_ROOT/web/.env.local"
RPC_URL="https://soroban-testnet.stellar.org"
PASSPHRASE="Test SDF Network ; September 2015"
FRIENDBOT="https://friendbot.stellar.org"
NAME="Oficio · Origen verificado"
SYMBOL="OFICIO"

# Lee una clave de web/.env.local (sin comillas). Vacío si no existe.
env_get() {
  [[ -f "$ENV_FILE" ]] || return 0
  { grep -E "^$1=" "$ENV_FILE" || true; } | tail -n1 | cut -d= -f2- | tr -d '\r' | sed -e 's/^"//' -e 's/"$//'
}

# Escribe/actualiza una clave preservando el resto del archivo.
env_set() {
  local key="$1" value="$2" tmp
  mkdir -p "$(dirname "$ENV_FILE")"
  touch "$ENV_FILE"
  tmp="$(mktemp)"
  grep -vE "^$key=" "$ENV_FILE" | tr -d '\r' > "$tmp" || true
  if [[ "$value" =~ [[:space:]\;\#] ]]; then
    printf '%s="%s"\n' "$key" "$value" >> "$tmp"
  else
    printf '%s=%s\n' "$key" "$value" >> "$tmp"
  fi
  cat "$tmp" > "$ENV_FILE"
  rm -f "$tmp"
}

PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-$(env_get PUBLIC_BASE_URL)}"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-http://localhost:3100}"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL%/}"
BASE_URI="$PUBLIC_BASE_URL/p/"

# 1. Cuenta de la asociación
SECRET="$(env_get ASSOCIATION_SECRET)"
if [[ -z "$SECRET" ]]; then
  echo ">> generando cuenta de la asociación"
  KEYS="$(in_docker -- sh -c 'stellar keys generate oficio-tmp --overwrite >/dev/null 2>&1 && stellar keys secret oficio-tmp && stellar keys address oficio-tmp')"
  SECRET="$(echo "$KEYS" | sed -n 1p | tr -d '\r')"
  PUBLIC="$(echo "$KEYS" | sed -n 2p | tr -d '\r')"
  [[ "$SECRET" == S* && "$PUBLIC" == G* ]] || { echo "no se pudo generar la clave" >&2; exit 1; }
  env_set ASSOCIATION_SECRET "$SECRET"
  env_set ASSOCIATION_PUBLIC "$PUBLIC"
else
  echo ">> reutilizando ASSOCIATION_SECRET de web/.env.local"
  PUBLIC="$(in_docker -e "STELLAR_SECRET_KEY=$SECRET" -- sh -c \
    'stellar keys add oficio-tmp --secret-key --overwrite </dev/null >/dev/null 2>&1 && stellar keys address oficio-tmp' \
    | tr -d '\r' | tail -n1)"
  [[ "$PUBLIC" == G* ]] || { echo "no se pudo derivar la cuenta pública" >&2; exit 1; }
fi
echo ">> cuenta de la asociación: $PUBLIC"

# Fondear si la cuenta no existe en testnet. Reintenta; si curl del host falla
# (proxies/antivirus en Windows), prueba desde el contenedor.
account_exists() {
  curl -fsS --max-time 20 "https://horizon-testnet.stellar.org/accounts/$PUBLIC" >/dev/null 2>&1 \
    || in_docker -- curl -fsS --max-time 20 "https://horizon-testnet.stellar.org/accounts/$PUBLIC" >/dev/null 2>&1
}
if ! account_exists; then
  echo ">> fondeando con friendbot"
  for i in 1 2 3 4 5; do
    curl -fsS --max-time 60 "$FRIENDBOT/?addr=$PUBLIC" >/dev/null 2>&1 \
      || in_docker -- curl -fsS --max-time 60 "$FRIENDBOT/?addr=$PUBLIC" >/dev/null 2>&1 || true
    account_exists && break
    echo "   reintento $i"; sleep 5
  done
  account_exists || { echo "no se pudo fondear $PUBLIC con friendbot" >&2; exit 1; }
fi

# 2. Compilar
echo ">> compilando"
if ! BUILD_LOG="$(in_docker -- stellar contract build --package sello 2>&1)"; then
  echo "$BUILD_LOG" >&2; echo "falló la compilación" >&2; exit 1
fi

# 3. Desplegar con el constructor (reintenta ante errores de red del RPC)
echo ">> desplegando (base_uri=$BASE_URI, name=$NAME, symbol=$SYMBOL)"
CONTRACT_ID=""
for i in 1 2 3 4; do
  OUT="$(in_docker \
    -e "STELLAR_ACCOUNT=$SECRET" \
    -e "STELLAR_RPC_URL=$RPC_URL" \
    -e "STELLAR_NETWORK_PASSPHRASE=$PASSPHRASE" \
    -e "ADMIN=$PUBLIC" -e "BASE_URI=$BASE_URI" -e "NAME=$NAME" -e "SYMBOL=$SYMBOL" \
    -- sh -c 'stellar contract deploy --wasm '"$WASM_PATH"' --source-account "$STELLAR_ACCOUNT" \
         --rpc-url "$STELLAR_RPC_URL" --network-passphrase "$STELLAR_NETWORK_PASSPHRASE" \
         -- --admin "$ADMIN" --base_uri "$BASE_URI" --name "$NAME" --symbol "$SYMBOL"' 2>&1 \
    | tr -d '\r' || true)"
  CONTRACT_ID="$( { echo "$OUT" | grep -E '^C[A-Z0-9]{55}$' || true; } | tail -n1)"
  [[ -n "$CONTRACT_ID" ]] && break
  echo "$OUT" | tail -n3 >&2
  echo "   reintento $i" >&2; sleep 5
done
[[ -n "$CONTRACT_ID" ]] || { echo "el deploy no devolvió un id de contrato" >&2; exit 1; }
echo "$OUT" | grep -iE 'transaction hash|stellar.expert' || true
echo ">> contrato: $CONTRACT_ID"

# 4. web/.env.local
env_set STELLAR_RPC_URL "$RPC_URL"
env_set STELLAR_NETWORK_PASSPHRASE "$PASSPHRASE"
env_set SELLO_CONTRACT_ID "$CONTRACT_ID"
env_set ASSOCIATION_SECRET "$SECRET"
env_set ASSOCIATION_PUBLIC "$PUBLIC"
env_set PUBLIC_BASE_URL "$PUBLIC_BASE_URL"
if [[ -z "$(env_get PANEL_PASSWORD)" ]]; then
  env_set PANEL_PASSWORD "$(od -An -N18 -tx1 /dev/urandom | tr -d ' \n')"
fi

echo ">> listo: web/.env.local actualizado"
echo "   https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
