#!/usr/bin/env python3
"""Arma referencias de voz nativas de Argentina (femeninas y masculinas) desde OpenSLR SLR61
(CC BY-SA 4.0) sin bajar el dataset entero, y genera muestras con la apertura del guion de Muro
para comparar de oído y elegir la voz más natural y prolija.

Uso:
  python tts/referencias.py
Salida:
  tts/voces/<id>.wav           referencia limpia (~12 s)
  tts/voces/muestras/<id>.wav  muestra hablada con el texto real de Muro (normalizada a -16 LUFS)
"""
import io
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from remotezip import RemoteZip

TTS = Path(__file__).resolve().parent
sys.path.insert(0, str(TTS))
VOCES = TTS / "voces"

# Hablantes nativos de Argentina (OpenSLR SLR61): femeninas y masculinas
CANDIDATAS_FIJAS = {
    "ar_f_02121": ("61/es_ar_female.zip", "02121"),
    "ar_f_04766": ("61/es_ar_female.zip", "04766"),
    "ar_f_04310": ("61/es_ar_female.zip", "04310"),
}

TEXTO_MUESTRA = (
    "Imaginá una obra colgada hace un mes en la pared de un bar o una bodega. "
    "¿Cuánto cobró su artista? Nada. Eso cambia con Muro: la obra cobra por día. Y si se enamoran, es suya."
)


def armar():
    VOCES.mkdir(exist_ok=True)
    candidatas = dict(CANDIDATAS_FIJAS)

    # Descubrir automáticamente 3 hablantes masculinos argentinos en es_ar_male.zip
    with RemoteZip("https://www.openslr.org/resources/61/es_ar_male.zip") as rz:
        nombres_m = sorted(n for n in rz.namelist() if n.endswith(".wav"))
        spks = []
        for n in nombres_m:
            parts = Path(n).stem.split("_")
            if len(parts) >= 2 and parts[1] not in spks:
                spks.append(parts[1])
            if len(spks) >= 3:
                break
        for spk in spks:
            candidatas[f"ar_m_{spk}"] = ("61/es_ar_male.zip", spk)

    por_zip: dict[str, list[tuple[str, str]]] = {}
    for vid, (z, spk) in candidatas.items():
        por_zip.setdefault(z, []).append((vid, spk))

    for z, lista in por_zip.items():
        with RemoteZip("https://www.openslr.org/resources/" + z) as rz:
            nombres = sorted(n for n in rz.namelist() if n.endswith(".wav"))
            for vid, spk in lista:
                dst = VOCES / f"{vid}.wav"
                if dst.exists():
                    print(f"referencia {vid}: ya existe")
                    continue
                archivos = [n for n in nombres if f"_{spk}_" in n]
                trozos, total, sr_final = [], 0.0, 24000
                for n in archivos:
                    w, sr = sf.read(io.BytesIO(rz.read(n)), dtype="float32")
                    sr_final = sr
                    d = len(w) / sr
                    if 2.2 <= d <= 5.5:
                        trozos += [w, np.zeros(int(0.35 * sr), dtype=np.float32)]
                        total += d
                    if total >= 12.0:
                        break
                if not trozos:
                    continue
                tmp = VOCES / f"{vid}.raw.wav"
                sf.write(tmp, np.concatenate(trozos), sr_final)
                subprocess.run(
                    [
                        "ffmpeg", "-loglevel", "error", "-y", "-i", str(tmp),
                        "-af", "highpass=f=70,loudnorm=I=-20",
                        "-ar", "24000", "-ac", "1", str(dst),
                    ],
                    check=True,
                )
                tmp.unlink()
                print(f"referencia {vid}: {total:.1f}s")
    return list(candidatas.keys())


def muestras(vids: list[str]):
    import torch
    import voz

    m, _ = voz.cargar_modelo("es")
    aj = voz.AJUSTES["es"]
    out_dir = VOCES / "muestras"
    out_dir.mkdir(exist_ok=True)
    for vid in vids:
        ref = VOCES / f"{vid}.wav"
        if not ref.exists():
            continue
        torch.manual_seed(17)
        wav = m.generate(
            TEXTO_MUESTRA,
            language_id="es",
            audio_prompt_path=str(ref),
            exaggeration=aj["exaggeration"],
            cfg_weight=aj["cfg_weight"],
            temperature=aj["temperature"],
        )
        raw = out_dir / f"{vid}.raw.wav"
        fin = out_dir / f"{vid}.wav"
        sf.write(raw, wav.squeeze(0).cpu().numpy(), m.sr)
        voz.ffmpeg(raw, fin, voz.CADENA + f",atempo={aj['tempo']},loudnorm=I=-16:TP=-1.5:LRA=7")
        raw.unlink()
        w, sr = sf.read(fin, dtype="float32")
        f0, ex = voz.tono(w, sr)
        print(f"muestra {vid}: tono={f0:.0f}Hz var={ex:.1f}st dur={len(w)/sr:.1f}s -> {fin}", flush=True)


if __name__ == "__main__":
    vids = armar()
    muestras(vids)
