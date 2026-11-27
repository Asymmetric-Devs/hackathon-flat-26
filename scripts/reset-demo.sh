#!/usr/bin/env bash
# Reinicia la demo en Testnet: despliega las dos instancias, siembra obras de ejemplo con un flujo
# real (una obra colgada cobrando en vivo, otra devuelta) y regenera la evidencia de la web.
# Correr unos minutos antes de presentar (tarda ~5 min). Con 1 "día" = 1 minuto, la obra colgada
# llega al 100 % del precio en ~100 minutos, por eso conviene reiniciar justo antes.
set -euo pipefail
cd "$(dirname "$0")/.."
bash scripts/deploy-testnet.sh
bash scripts/seed-testnet.sh
python3 -I scripts/make-evidence-json.py
echo
echo "Listo. Hacer 'cd web && npm run build' (o dejar corriendo 'npm run dev') para ver la demo nueva."
