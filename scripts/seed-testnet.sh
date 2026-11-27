#!/usr/bin/env bash
# Siembra la instancia DEMO en testnet y ejecuta un flujo end-to-end real.
#   1. Publica 6 obras (artista = muro-artist).
#   2. muro-venue cuelga `manet-bar` (30 días = 30 min en demo) -> queda Hung en vivo.
#   3. Ciclo completo de `candido-curupayti`: hang -> stop -> confirm_return (queda con historial).
#   4. Espera ~2 min desde el hang de manet-bar, muestra lo devengado y hace claim.
#   5. muro-guest da una propina a manet-bar.
#   6. Escribe docs/evidencia-testnet.md con cada hash y enlaces a stellar.expert.
# Las demás obras quedan Available.
#
# Requisito: haber corrido scripts/deploy-testnet.sh. Uso: scripts/seed-testnet.sh
# Aborta si el contrato ya tiene obras (para no duplicar); forzar con FORCE=1.
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

CID="$(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1]))["instances"]["demo"]["contractId"])' "$DEPLOYED_JSON")"
ARTIST="$(stellar keys address muro-artist)"
VENUE="$(stellar keys address muro-venue)"
GUEST="$(stellar keys address muro-guest)"
EVID="$ROOT/docs/evidencia-testnet.md"

COUNT="$(view muro-admin "$CID" count | tr -d '"')"
if [ "$COUNT" != "0" ] && [ -z "${FORCE:-}" ]; then
  echo "La instancia demo ya tiene $COUNT obras. Re-desplegá o usá FORCE=1." >&2
  exit 1
fi

ROWS=""
row() { # row <paso> <descripción>  (usa el hash de la última invoke)
  local LAST_TX; LAST_TX="$(last_tx)"
  ROWS+="| $1 | $2 | [\`${LAST_TX:0:8}…\`]($EXPLORER/tx/$LAST_TX) |"$'\n'
  echo "  [$1] $2 -> $LAST_TX"
}

# slug precio_XLM tarifa_XLM_por_día depósito_XLM
WORKS=(
  "manet-bar 300 3 40"
  "candido-curupayti 150 2 20"
  "fader-mantones 200 2 30"
  "pueyrredon-alto 400 4 60"
  "afklint-retablo 250 3 40"
  "vangogh-terraza 100 1 25"
)

echo "==> Publicando obras"
M=""; C=""
for w in "${WORKS[@]}"; do
  read -r slug price rate dep <<<"$w"
  id="$(invoke muro-artist "$CID" publish --artist "$ARTIST" --price $((price * XLM)) \
    --rate $((rate * XLM)) --deposit $((dep * XLM)) --meta "$slug" | tr -d '"')"
  [ "$slug" = "manet-bar" ] && M="$id"
  [ "$slug" = "candido-curupayti" ] && C="$id"
  row "publish" "\`$slug\` -> obra #$id (precio $price XLM, $rate XLM/día, depósito $dep XLM)"
done

echo "==> manet-bar: hang 30 días"
invoke muro-venue "$CID" hang --venue "$VENUE" --work_id "$M" --days 30 >/dev/null
row "hang" "muro-venue cuelga \`manet-bar\` por 30 días (depósito 40 XLM + 90 XLM prepago)"
HANG_AT=$(date +%s)

echo "==> candido-curupayti: ciclo completo"
invoke muro-venue "$CID" hang --venue "$VENUE" --work_id "$C" --days 3 >/dev/null
row "hang" "muro-venue cuelga \`candido-curupayti\` por 3 días (depósito 20 XLM + 6 XLM)"
sleep 30
invoke muro-venue "$CID" stop --venue "$VENUE" --work_id "$C" >/dev/null
row "stop" "muro-venue devuelve \`candido-curupayti\` (liquida lo devengado, reembolsa prepago, retiene depósito)"
invoke muro-artist "$CID" confirm_return --artist "$ARTIST" --work_id "$C" >/dev/null
row "confirm_return" "muro-artist confirma la devolución (depósito 20 XLM vuelve al venue; queda en el historial)"

echo "==> Esperando ~2 min desde el hang de manet-bar"
while [ $(( $(date +%s) - HANG_AT )) -lt 125 ]; do sleep 5; done

ACCRUED="$(view muro-guest "$CID" accrued --work_id "$M" | tr -d '"')"
echo "devengado antes del claim: $ACCRUED stroops"
CLAIMED="$(invoke muro-guest "$CID" claim --work_id "$M" | tr -d '"')"
row "claim" "muro-guest (cualquiera) ejecuta \`claim\` sobre \`manet-bar\`: devengado previo $ACCRUED stroops, pagado al artista $CLAIMED stroops"

invoke muro-guest "$CID" tip --from "$GUEST" --work_id "$M" --amount $((5 * XLM)) >/dev/null
row "tip" "muro-guest da propina de 5 XLM al artista por \`manet-bar\`"

LEASE="$(view muro-admin "$CID" lease --id "$M")"
HIST="$(view muro-admin "$CID" history --id "$C")"

mkdir -p "$(dirname "$EVID")"
cat > "$EVID" <<MD
# Evidencia en testnet

Flujo real ejecutado con \`scripts/seed-testnet.sh\` sobre la instancia **demo** (1 día = 60 s, gracia 1 día).

- Contrato demo: [\`$CID\`]($EXPLORER/contract/$CID)
- Token (XLM nativo, SAC): [\`$(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1]))["token"])' "$DEPLOYED_JSON")\`]($EXPLORER/contract/$(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1]))["token"])' "$DEPLOYED_JSON"))
- Artista: [\`$ARTIST\`]($EXPLORER/account/$ARTIST)
- Venue: [\`$VENUE\`]($EXPLORER/account/$VENUE)
- Visitante (propina / claim): [\`$GUEST\`]($EXPLORER/account/$GUEST)

| Paso | Qué ocurre | Tx |
|---|---|---|
$ROWS
## Estado final

- \`manet-bar\` (obra #$M): **Hung** en vivo. Devengado al momento del claim: $ACCRUED stroops.
- \`candido-curupayti\` (obra #$C): **Available**, con un registro \`Returned\` en el historial.
- Resto de las obras: **Available**.

Lease actual de \`manet-bar\`:

\`\`\`json
$LEASE
\`\`\`

Historial de \`candido-curupayti\`:

\`\`\`json
$HIST
\`\`\`
MD
echo "==> Escrito $EVID"
