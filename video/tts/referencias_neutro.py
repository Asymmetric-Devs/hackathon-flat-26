#!/usr/bin/env python3
"""Genera 4 muestras de voz latinoamericanas limpias (sin sheísmo / 'sho' marcado)
desde OpenSLR SLR72 (Colombia) y SLR73 (Perú), 2 femeninas y 2 masculinas,
para comparar con ar_f_04766 y ar_m_01523.
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

TEXTO_MUESTRA = (
    "Imaginá una obra colgada hace un mes en la pared de un bar o una bodega. "
    "¿Cuánto cobró su artista? Nada. Eso cambia con Muro: la obra cobra por día. Y si se enamoran, es suya."
)

ZIPS = [
    ("co_f", "72/es_co_female.zip", 2),
    ("co_m", "72/es_co_male.zip", 2),
]


def armar():
    VOCES.mkdir(exist_ok=True)
    vids = []
    for pref, z, count in ZIPS:
        with RemoteZip("https://www.openslr.org/resources/" + z) as rz:
            nombres = sorted(n for n in rz.namelist() if n.endswith(".wav"))
            spks = []
            for n in nombres:
                parts = Path(n).stem.split("_")
                if len(parts) >= 2 and parts[1] not in spks:
                    spks.append(parts[1])
                if len(spks) >= count:
                    break
            for spk in spks:
                vid = f"{pref}_{spk}"
                vids.append(vid)
                dst = VOCES / f"{vid}.wav"
                if dst.exists():
                    continue
                archivos = [n for n in nombres if f"_{spk}_" in n]
                trozos, total, sr_final = [], 0.0, 24000
                for n in archivos:
                    w, sr = sf.read(io.BytesIO(rz.read(n)), dtype="float32")
                    sr_final = sr
                    d = len(w) / sr
                    if 2.2 <= d <= 5.5:
                        trozos += [w, np.zeros(int(0.35 * sr), dtype="float32")]
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
                print(f"referencia {vid}: {total:.1f}s", flush=True)
    return vids


def muestras(vids):
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
    muestras(armar())
