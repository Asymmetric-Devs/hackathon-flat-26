#!/usr/bin/env python3
"""Locución local en español rioplatense para el video de Muro (Apple Silicon, sin cuentas externas).

Usa Chatterbox Multilingual V3 (ResembleAI/Chatterbox-Multilingual-es-mx-latam, MIT) con una referencia
nativa de español de Argentina (OpenSLR SLR61, CC BY-SA 4.0, armada con tts/referencias.py).

Por cada línea de guion.json genera varias tomas y elige la mejor con Whisper (fidelidad al texto),
consistencia de tono entre líneas, variación tonal natural y ritmo ágil.

Uso:
  python tts/voz.py es [--tomas 6] [--ref ar_f_02121]
"""
import argparse
import difflib
import hashlib
import json
import re
import subprocess
import unicodedata
from pathlib import Path

import numpy as np
import soundfile as sf

RAIZ = Path(__file__).resolve().parent.parent          # video/
TTS = RAIZ / "tts"
CACHE = TTS / "cache"
GUION = json.loads((RAIZ / "guion.json").read_text())
M_WHISPER = "mlx-community/whisper-large-v3-turbo"

# Ajustes naturales para español (sin atempo artificial para evitar timbre robótico/vocoder)
AJUSTES = {
    "es": {
        "exaggeration": 0.45,
        "cfg_weight": 0.42,
        "temperature": 0.65,
        "tempo": 1.0,
        "referencia": "voces/ar_m_01523.wav",
    },
}

# Cadena de voz: limpia graves, quita barro, suma presencia cálida y aire, compresión suave.
CADENA = (
    "highpass=f=80,equalizer=f=220:t=q:w=1:g=-2,equalizer=f=3600:t=q:w=1.2:g=2.2,"
    "equalizer=f=9000:t=q:w=1:g=1.0,acompressor=threshold=-20dB:ratio=2.8:attack=6:release=90:makeup=2"
)
SR = 48000


def cargar_modelo(lang: str = "es"):
    import torch
    dev = "mps" if torch.backends.mps.is_available() else "cpu"
    from huggingface_hub import snapshot_download
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS

    latam = Path(
        snapshot_download(
            "ResembleAI/Chatterbox-Multilingual-es-mx-latam",
            allow_patterns=["t3_es_mx_latam.safetensors", "s3gen_v3.pt", "*.json"],
        )
    )
    base = Path(
        snapshot_download(
            "ResembleAI/chatterbox",
            allow_patterns=["ve.pt", "conds.pt", "Cangjie5_TC.json"],
        )
    )
    d = TTS / "models" / "es-latam"
    d.mkdir(parents=True, exist_ok=True)
    for dst, src in {
        "t3_es_mx_latam.safetensors": latam / "t3_es_mx_latam.safetensors",
        "s3gen.pt": latam / "s3gen_v3.pt",
        "grapheme_mtl_merged_expanded_v1.json": latam / "grapheme_mtl_merged_expanded_v1.json",
        "ve.pt": base / "ve.pt",
        "conds.pt": base / "conds.pt",
        "Cangjie5_TC.json": base / "Cangjie5_TC.json",
    }.items():
        link = d / dst
        if link.is_symlink() or link.exists():
            link.unlink()
        link.symlink_to(src.resolve())

    orig = torch.nn.Module.load_state_dict

    def laxo(self, sd, strict=True, **kw):
        return orig(self, sd, strict=False if type(self).__name__ == "S3Token2Wav" else strict, **kw)

    torch.nn.Module.load_state_dict = laxo
    try:
        m = ChatterboxMultilingualTTS.from_local(d, dev, t3_model="t3_es_mx_latam.safetensors")
    finally:
        torch.nn.Module.load_state_dict = orig

    return m, lambda texto, aj: m.generate(
        texto,
        language_id="es",
        exaggeration=aj["exaggeration"],
        cfg_weight=aj["cfg_weight"],
        temperature=aj["temperature"],
        audio_prompt_path=str(TTS / aj["referencia"]) if aj.get("referencia") else None,
    )


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9%]+", " ", s).strip()


def similitud(a: str, b: str) -> float:
    return difflib.SequenceMatcher(None, norm(a).split(), norm(b).split()).ratio()


def recortar(w: np.ndarray, sr: int, umbral_db=-42, margen=0.05) -> np.ndarray:
    k = int(sr * 0.01)
    env = np.convolve(np.abs(w), np.ones(k) / k, mode="same")
    on = np.where(env > 10 ** (umbral_db / 20))[0]
    if len(on) == 0:
        return w
    return w[max(0, on[0] - int(margen * sr)) : min(len(w), on[-1] + int(margen * sr))]


def tono(w: np.ndarray, sr: int) -> tuple[float, float]:
    import librosa
    y = librosa.resample(w, orig_sr=sr, target_sr=16000)
    f0, _, _ = librosa.pyin(y, fmin=70, fmax=420, sr=16000)
    f0 = f0[~np.isnan(f0)]
    if len(f0) < 10:
        return 0.0, 0.0
    return float(np.median(f0)), float(np.std(12 * np.log2(f0 / np.median(f0))))


def ffmpeg(entrada: Path, salida: Path, filtros: str):
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-i", str(entrada), "-af", filtros, "-ar", str(SR), "-ac", "1", str(salida)],
        check=True,
    )


def transcribir(path: Path, lang: str) -> dict:
    import mlx_whisper
    return mlx_whisper.transcribe(
        str(path),
        path_or_hf_repo=M_WHISPER,
        language=lang,
        word_timestamps=True,
        condition_on_previous_text=False,
    )


def palabras_whisper(res: dict) -> list[dict]:
    return [
        {"w": w["word"].strip(), "s": float(w["start"]), "e": float(w["end"])}
        for seg in res["segments"]
        for w in seg.get("words", [])
    ]


def alinear(destino: list[str], fuente: list[dict]) -> list[dict]:
    a = [norm(t) for t in destino]
    b = [norm(f["w"]) for f in fuente]
    out: list[dict | None] = [None] * len(destino)
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                out[i1 + k] = {"w": destino[i1 + k], "s": fuente[j1 + k]["s"], "e": fuente[j1 + k]["e"]}
        elif op == "replace":
            s, e = fuente[j1]["s"], fuente[j2 - 1]["e"]
            pesos = [max(len(a[i]), 1) for i in range(i1, i2)]
            t = s
            for n, i in enumerate(range(i1, i2)):
                d = (e - s) * pesos[n] / sum(pesos)
                out[i] = {"w": destino[i], "s": t, "e": t + d}
                t += d
    for i, o in enumerate(out):
        if o is None:
            prev = next((out[j]["e"] for j in range(i - 1, -1, -1) if out[j]), fuente[0]["s"] if fuente else 0.0)
            nxt = next((out[j]["s"] for j in range(i + 1, len(out)) if out[j]), prev + 0.25)
            out[i] = {"w": destino[i], "s": prev, "e": max(prev + 0.05, nxt)}
    return out


def generar(lang: str, n_tomas: int, ref_override: str | None = None):
    import torch

    g = GUION[lang]
    aj = dict(AJUSTES[lang])
    if ref_override:
        aj["referencia"] = f"voces/{ref_override}.wav" if not ref_override.endswith(".wav") else ref_override

    CACHE.mkdir(exist_ok=True)
    salida_audio = RAIZ / "public" / "voz" / lang
    salida_audio.mkdir(parents=True, exist_ok=True)
    firma = json.dumps({k: aj.get(k) for k in ("exaggeration", "cfg_weight", "temperature", "referencia")}, sort_keys=True)

    pend = []
    for ln in g["lineas"]:
        habla = ln.get("habla", ln["texto"])
        clave = hashlib.sha1(f"{lang}|{habla}|{firma}".encode()).hexdigest()[:12]
        ln["_tomas"] = [CACHE / f"{lang}_{ln['id']}_{clave}_t{k}.wav" for k in range(n_tomas)]
        pend += [(habla, k, p) for k, p in enumerate(ln["_tomas"]) if not p.exists()]
    if pend:
        import gc
        m, decir = cargar_modelo(lang)
        for habla, k, p in pend:
            torch.manual_seed(17 + 11 * k)
            with torch.inference_mode():
                wav = decir(habla, aj)
            sf.write(p, wav.squeeze(0).cpu().numpy(), m.sr)
            del wav
            gc.collect()
            if torch.backends.mps.is_available():
                torch.mps.empty_cache()
            print(f"  toma {p.name}", flush=True)
        del m
        gc.collect()
        if torch.backends.mps.is_available():
            torch.mps.empty_cache()

    datos = {"lang": lang, "modelo": "chatterbox-es-mx-latam", "referencia": aj["referencia"], "lineas": []}
    for ln in g["lineas"]:
        habla, texto = ln.get("habla", ln["texto"]), ln["texto"]
        ln["_med"] = []
        for k, raw in enumerate(ln["_tomas"]):
            proc = raw.with_suffix(".proc.wav")
            ffmpeg(raw, proc, CADENA + f",atempo={aj['tempo']}")
            w, sr = sf.read(proc, dtype="float32")
            w = recortar(w, sr)
            sf.write(proc, w, sr)
            res = transcribir(proc, lang)
            sim = max(similitud(habla, res["text"]), similitud(texto, res["text"]))
            f0, ex = tono(w, sr)
            ln["_med"].append({"k": k, "proc": proc, "res": res, "sim": sim, "f0": f0, "ex": ex, "dur": len(w) / sr})

    objetivo = float(np.median([m["f0"] for ln in g["lineas"] for m in ln["_med"] if m["f0"] > 0]))
    print(f"  tono objetivo (mediana): {objetivo:.0f} Hz")
    for ln in g["lineas"]:
        habla, texto = ln.get("habla", ln["texto"]), ln["texto"]
        mejor = None
        for m in ln["_med"]:
            pps = len(habla.split()) / m["dur"]
            score = (
                (m["sim"] if m["sim"] >= 0.90 else m["sim"] - 0.6)
                + 0.06 * min(m["ex"], 4.5)
                - 0.008 * abs(m["f0"] - objetivo)
                - (0 if 2.1 <= pps <= 4.0 else 0.25)
            )
            print(f"  [{ln['id']}] toma {m['k'] + 1}: fid={m['sim']:.2f} tono={m['f0']:.0f}Hz var={m['ex']:.2f}st pps={pps:.1f} dur={m['dur']:.2f}s score={score:.2f}")
            if mejor is None or score > mejor["score"]:
                mejor = {**m, "score": score, "toma": m["k"] + 1}
        final = salida_audio / f"{ln['id']}.wav"
        ffmpeg(mejor["proc"], final, "loudnorm=I=-16:TP=-1.5:LRA=7")
        w, sr = sf.read(final, dtype="float32")
        t_texto = alinear(texto.split(), alinear(habla.split(), palabras_whisper(mejor["res"])))
        datos["lineas"].append(
            {
                "id": ln["id"],
                "bloque": ln.get("bloque", ""),
                "pausa_despues": ln.get("pausa_despues", 0.4),
                "texto": texto,
                "archivo": f"voz/{lang}/{ln['id']}.wav",
                "duracion": round(len(w) / sr, 3),
                "toma": mejor["toma"],
                "fidelidad": round(mejor["sim"], 3),
                "palabras": [{"w": t["w"], "s": round(t["s"], 3), "e": round(t["e"], 3)} for t in t_texto],
            }
        )
        if mejor["sim"] < 0.90:
            print(f"  AVISO [{ln['id']}]: fidelidad baja ({mejor['sim']:.2f}): «{mejor['res']['text'].strip()}»")
        print(f"  -> {ln['id']}: toma {mejor['toma']}, {datos['lineas'][-1]['duracion']:.2f}s")

    out = RAIZ / "src" / "data" / f"voz-{lang}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(datos, ensure_ascii=False, indent=1))
    total_voz = sum(l["duracion"] for l in datos["lineas"])
    total_pausas = sum(l["pausa_despues"] for l in datos["lineas"])
    print(f"total voz: {total_voz:.2f}s + pausas: {total_pausas:.2f}s = {total_voz + total_pausas:.2f}s -> {out}")

    # Exportar pista única concatenada para revisión rápida de oído antes de renderizar
    partes = []
    for l in datos["lineas"]:
        w, _ = sf.read(RAIZ / "public" / l["archivo"], dtype="float32")
        partes.append(w)
        pausa = float(l.get("pausa_despues", 0.45))
        if pausa > 0:
            partes.append(np.zeros(int(pausa * SR), dtype=np.float32))
    preview = RAIZ / "out" / f"preview-voz-{Path(aj['referencia']).stem}.wav"
    preview.parent.mkdir(parents=True, exist_ok=True)
    sf.write(preview, np.concatenate(partes), SR)
    print(f"preview audio completo -> {preview}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("lang", nargs="?", default="es", choices=["es"])
    ap.add_argument("--tomas", type=int, default=4, help="tomas por línea")
    ap.add_argument("--ref", default=None, help="ID de referencia en tts/voces/ (ej: ar_f_02121)")
    a = ap.parse_args()
    generar(a.lang, a.tomas, a.ref)
