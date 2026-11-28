#!/usr/bin/env bash
# Recarga el prepago de la obra colgada en la instancia demo para que el contador siga corriendo.
# Uso: scripts/refresh-demo.sh [work_id=0] [dias=100]
# En la demo 1 "día" dura 60 s. La obra #0 (precio 300, 3 XLM/día) se compra sola a los 100 días (~100 minutos),
# así que más prepago que eso solo inmoviliza fondos del espacio hasta la venta.
source "$(dirname "$0")/lib.sh"
WORK="${1:-0}"; DAYS="${2:-100}"
CID="$(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1]))["instances"]["demo"]["contractId"])' "$DEPLOYED_JSON")"
VENUE="$(stellar keys address muro-venue)"
echo "Sumando $DAYS días de prepago a la obra #$WORK (contrato demo $CID)"
invoke muro-venue "$CID" top_up --venue "$VENUE" --work_id "$WORK" --days "$DAYS" >/dev/null
echo "Listo: $EXPLORER/tx/$(last_tx)"
