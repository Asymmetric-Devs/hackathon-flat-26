#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PY="${PYTHON_BIN:-$ROOT/tts/.venv-chatterbox/bin/python}"
REF="${1:-ar_m_01523}"
TOMAS="${2:-2}"
APP_URL="${APP_URL:-https://muro.asymmetric.com.ar/}"

cd "$ROOT"

echo "=== 1/5 Capturando pantallas estáticas y Stellar Expert ==="
node scripts/capture.mjs "$APP_URL"

echo "=== 2/5 Grabando clips reales a 30 fps ==="
node scripts/capture-clips.mjs "$APP_URL"

echo "=== 3/5 Generando locución ($REF, $TOMAS tomas/línea) ==="
if [ ! -f "$ROOT/tts/voces/${REF}.wav" ]; then
  "$PY" tts/referencias.py
fi
"$PY" tts/voz.py es --tomas "$TOMAS" --ref "$REF"

echo "=== 4/5 Sintetizando cama musical a medida (114 BPM) ==="
read -r DUR ENTRADA DUCK_INI DUCK_FIN FIN < <("$PY" -c '
import json
from pathlib import Path
v = json.loads(Path("src/data/voz-es.json").read_text())
t = 0.6
starts, durs = {}, {}
for l in v["lineas"]:
    starts[l["id"]] = t
    durs[l["id"]] = l["duracion"]
    t += l["duracion"] + l.get("pausa_despues", 0.45)
last = v["lineas"][-1]
total = starts[last["id"]] + last["duracion"] + 3.2
entrada = starts.get("b01_muro", 10.0)
duck_ini = starts.get("b03_laura", 48.0)
duck_fin = duck_ini + durs.get("b03_laura", 16.0)
fin = starts[last["id"]] + last["duracion"] * 0.52
print(f"{total:.2f} {entrada:.2f} {duck_ini:.2f} {duck_fin:.2f} {fin:.2f}")
')
"$PY" tts/musica.py --dur "$DUR" --entrada "$ENTRADA" --duck-ini "$DUCK_INI" --duck-fin "$DUCK_FIN" --fin "$FIN" --salida public/musica/cama-es.wav

echo "=== 5/5 Typecheck y render final 1080p 30fps ==="
npm run typecheck
mkdir -p out
npx remotion render MuroES out/muro-es.mp4

echo "=== LISTO: $ROOT/out/muro-es.mp4 ==="
ls -lh "$ROOT/out/muro-es.mp4"
