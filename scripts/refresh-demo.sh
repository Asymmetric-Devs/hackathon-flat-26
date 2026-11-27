#!/usr/bin/env bash
# Recarga el prepago de la obra colgada en la instancia demo para que el contador siga corriendo.
# Uso: scripts/refresh-demo.sh [work_id=0] [dias=600]
# En la demo 1 "día" dura 60 s, así que 600 días alcanzan para 10 horas de presentación.
source "$(dirname "$0")/lib.sh"
WORK="${1:-0}"; DAYS="${2:-600}"
CID="$(python3 -I -c "import json;print(json.load(open('$DEPLOYED_JSON'))['instances']['demo']['contractId'])")"
VENUE="$(stellar keys address muro-venue)"
echo "Sumando $DAYS días de prepago a la obra #$WORK (contrato demo $CID)"
invoke muro-venue "$CID" top_up --venue "$VENUE" --work_id "$WORK" --days "$DAYS" >/dev/null
echo "Listo: $EXPLORER/tx/$(last_tx)"
