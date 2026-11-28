#!/usr/bin/env python3
"""Locución rápida y liviana con Piper (voz argentina "daniela", ONNX en CPU) para el video de Muro.

Genera el mismo formato que tts/voz.py (public/voz/es/<id>.wav + src/data/voz-es.json con palabra por palabra),
pero en segundos y con muy poca memoria: no hace falta GPU ni 10 GB libres.

Uso (con el entorno de voz.py, que tiene mlx-whisper):
  tts/.venv-chatterbox/bin/python tts/voz_piper.py [--modelo es_AR-daniela-high] [--velocidad 1.0]
Requiere el entorno de Piper:
  uv venv -p 3.11 tts/.venv-piper && uv pip install -p tts/.venv-piper/bin/python piper-tts
  (cd tts/models/piper && ../../.venv-piper/bin/python -m piper.download_voices es_AR-daniela-high)
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
import voz as V  # noqa: E402  (reutiliza ffmpeg, recortar, transcribir, alinear…)

RAIZ, TTS = V.RAIZ, V.TTS
PIPER_PY = TTS / ".venv-piper" / "bin" / "python"

# Piper suena limpio y algo plano: un poco de presencia y aire, compresión suave.
CADENA = (
    "highpass=f=70,equalizer=f=200:t=q:w=1:g=-1.5,equalizer=f=3200:t=q:w=1.2:g=2.0,"
    "equalizer=f=8500:t=q:w=1:g=1.2,acompressor=threshold=-21dB:ratio=2.4:attack=8:release=110:makeup=2"
)


def sintetizar(texto: str, modelo: str, velocidad: float, destino: Path):
    cmd = [
        str(PIPER_PY), "-m", "piper",
        "-m", str(TTS / "models" / "piper" / f"{modelo}.onnx"),
        "-f", str(destino),
        "--length-scale", str(round(1.0 / velocidad, 3)),
        "--sentence-silence", "0.28",
    ]
    subprocess.run(cmd, input=texto.encode(), check=True, capture_output=True)


def generar(modelo: str, velocidad: float):
    g = V.GUION["es"]
    cache = TTS / "cache"
    cache.mkdir(exist_ok=True)
    salida_audio = RAIZ / "public" / "voz" / "es"
    salida_audio.mkdir(parents=True, exist_ok=True)

    datos = {"lang": "es", "modelo": f"piper-{modelo}", "referencia": modelo, "lineas": []}
    for ln in g["lineas"]:
        habla, texto = ln.get("habla", ln["texto"]), ln["texto"]
        raw = cache / f"piper_{modelo}_{ln['id']}.wav"
        sintetizar(habla, modelo, velocidad, raw)
        proc = raw.with_suffix(".proc.wav")
        V.ffmpeg(raw, proc, CADENA)
        w, sr = sf.read(proc, dtype="float32")
        w = V.recortar(w, sr)
        sf.write(proc, w, sr)
        res = V.transcribir(proc, "es")
        sim = max(V.similitud(habla, res["text"]), V.similitud(texto, res["text"]))
        final = salida_audio / f"{ln['id']}.wav"
        V.ffmpeg(proc, final, "loudnorm=I=-16:TP=-1.5:LRA=7")
        w, sr = sf.read(final, dtype="float32")
        t_texto = V.alinear(texto.split(), V.alinear(habla.split(), V.palabras_whisper(res)))
        datos["lineas"].append(
            {
                "id": ln["id"],
                "bloque": ln.get("bloque", ""),
                "pausa_despues": ln.get("pausa_despues", 0.4),
                "texto": texto,
                "archivo": f"voz/es/{ln['id']}.wav",
                "duracion": round(len(w) / sr, 3),
                "toma": 1,
                "fidelidad": round(sim, 3),
                "palabras": [{"w": t["w"], "s": round(t["s"], 3), "e": round(t["e"], 3)} for t in t_texto],
            }
        )
        aviso = "  <- revisar" if sim < 0.90 else ""
        print(f"  {ln['id']}: {datos['lineas'][-1]['duracion']:.2f}s fid={sim:.2f}{aviso}", flush=True)

    out = RAIZ / "src" / "data" / "voz-es.json"
    out.write_text(json.dumps(datos, ensure_ascii=False, indent=1))
    total = sum(l["duracion"] for l in datos["lineas"]) + sum(l["pausa_despues"] for l in datos["lineas"])
    print(f"total voz + pausas: {total:.1f}s -> {out}")

    partes = []
    for l in datos["lineas"]:
        wv, _ = sf.read(RAIZ / "public" / l["archivo"], dtype="float32")
        partes.append(wv)
        partes.append(np.zeros(int(float(l.get("pausa_despues", 0.45)) * V.SR), dtype=np.float32))
    prev = RAIZ / "out" / f"preview-voz-piper-{modelo}.wav"
    prev.parent.mkdir(parents=True, exist_ok=True)
    sf.write(prev, np.concatenate(partes), V.SR)
    print(f"preview audio completo -> {prev}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--modelo", default="es_AR-daniela-high")
    ap.add_argument("--velocidad", type=float, default=1.0, help="1.0 normal; 1.08 un poco más ágil")
    a = ap.parse_args()
    generar(a.modelo, a.velocidad)
