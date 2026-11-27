#!/usr/bin/env python3
"""Convierte docs/evidencia-testnet.md en web/src/evidence.json (la tabla de evidencia de la web)."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SLUG = {
    "manet-bar": "Un bar aux Folies-Bergère",
    "candido-curupayti": "Después de la batalla de Curupaytí",
    "fader-mantones": "Los mantones de Manila",
    "pueyrredon-alto": "Un alto en el campo",
    "afklint-retablo": "Retablo n.º 1",
    "vangogh-terraza": "Terraza de café por la noche",
}
VERB = {
    "publish": "Se publica",
    "hang": "Se cuelga",
    "stop": "Se frena y se devuelve",
    "confirm_return": "El artista confirma la devolución",
    "claim": "Cobro de lo devengado",
    "tip": "Propina al artista",
}
WHO = [("muro-venue", "el espacio"), ("muro-artist", "el artista"), ("muro-guest", "un visitante")]

rows = []
pat = re.compile(r"\| (publish|hang|stop|confirm_return|claim|tip) \| (.*?) \| \[`[0-9a-f…]+`\]\(https://stellar\.expert/explorer/testnet/tx/([0-9a-f]{64})\)")
for line in (ROOT / "docs" / "evidencia-testnet.md").read_text(encoding="utf-8").splitlines():
    m = pat.match(line)
    if not m:
        continue
    kind, text, h = m.groups()
    text = text.replace("`", "")
    for k, v in SLUG.items():
        text = text.replace(k, v)
    for k, v in WHO:
        text = text.replace(k, v)
    text = text.replace(" -> ", " → ").replace("(cualquiera) ", "")
    text = text[0].upper() + text[1:]
    rows.append({"label": f"{VERB[kind]}. {text}", "hash": h})

out = ROOT / "web" / "src" / "evidence.json"
out.write_text(json.dumps({"rows": rows}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(f"{len(rows)} transacciones -> {out.relative_to(ROOT)}")
