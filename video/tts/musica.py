#!/usr/bin/env python3
"""Cama musical cálida y editorial sintetizada localmente para Muro (sin pistas de terceros).

Estética: piano con fieltro / Rhodes cálido (armónicos suaves en Dmaj9 - Bm7 - Gmaj9 - A6),
pulso percusivo muy sobrio que entra recién cuando aparecen las obras en el hero (`--entrada`),
baja un punto durante el testimonio de Laura Zapata (`--duck-ini` .. `--duck-fin`),
y resuelve en un acorde abierto cálido sobre el cierre de MURO (`--fin`).

Uso:
  python tts/musica.py --dur 160 --entrada 10 --fin 152 [--duck-ini 48 --duck-fin 66]
"""
import argparse
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 48000
BPM = 114
BEAT = 60.0 / BPM


def midi(n: float) -> float:
    return 440.0 * 2 ** ((n - 69.0) / 12.0)


def lowpass_fft(x: np.ndarray, fc: float) -> np.ndarray:
    """Filtro pasa-bajos suave en frecuencia (rápido incluso para 160+ segundos)."""
    n = len(x)
    X = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(n, 1.0 / SR)
    H = 1.0 / np.sqrt(1.0 + (freqs / fc) ** 4)
    return np.fft.irfft(X * H, n)


def felt_note(freq: float, dur: float, vel: float = 1.0) -> np.ndarray:
    """Tono tipo piano con fieltro / Rhodes cálido (fundamental + 2do/3er armónico suave)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    att = np.minimum(1.0, t / 0.018)
    dec = np.exp(-t * 1.45)
    body = (
        1.00 * np.sin(2 * np.pi * freq * t)
        + 0.28 * np.sin(2 * np.pi * 2 * freq * t) * np.exp(-t * 3.0)
        + 0.09 * np.sin(2 * np.pi * 3 * freq * t) * np.exp(-t * 6.0)
    )
    return body * att * dec * vel


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dur", type=float, required=True)
    ap.add_argument("--entrada", type=float, default=10.0, help="segundo en que entra el pulso rítmico")
    ap.add_argument("--fin", type=float, required=True, help="segundo en que entra el acorde final")
    ap.add_argument("--duck-ini", type=float, default=48.0)
    ap.add_argument("--duck-fin", type=float, default=66.0)
    ap.add_argument("--salida", default=str(Path(__file__).resolve().parent.parent / "public/musica/cama-es.wav"))
    a = ap.parse_args()

    N = int(a.dur * SR)
    t = np.arange(N) / SR
    rng = np.random.default_rng(26)

    # Progresión cálida editorial en Re mayor: Dmaj9 - Bm9 - Gmaj9 - A13sus4
    acordes = [
        [50, 57, 61, 64, 66],  # Dmaj9
        [47, 54, 57, 61, 62],  # Bm9
        [43, 50, 54, 57, 59],  # Gmaj9
        [45, 52, 55, 59, 61],  # A13sus
    ]
    raices = [38, 35, 31, 33]
    bar = 4 * BEAT
    fin_i = min(N, int(a.fin * SR))

    # 1. Piano con fieltro (arpegio lento y expresivo desde el segundo --entrada - 3)
    piano = np.zeros(N, dtype=np.float64)
    t0 = max(0.0, a.entrada - 2.5)
    k = 0
    while t0 < a.fin - 0.5:
        ch = acordes[k % 4]
        # Acorde arpegiado suavemente en tiempo 1 del compás doble
        for idx, note in enumerate(ch):
            start = int((t0 + idx * 0.09) * SR)
            if start >= fin_i:
                break
            nt = felt_note(midi(note), min(2 * bar, (N - start) / SR), vel=0.14 if idx > 0 else 0.17)
            piano[start : start + len(nt)] += nt
        # Motivo melódico delicado en la segunda mitad del compás doble
        if t0 >= a.entrada:
            for step_i, deg in enumerate([4, 3, 2, 4]):
                st = int((t0 + (2 + step_i * 1.5) * BEAT) * SR)
                if st >= fin_i:
                    break
                nt = felt_note(midi(ch[deg % len(ch)] + 12), min(1.8, (N - st) / SR), vel=0.065)
                piano[st : st + len(nt)] += nt
        t0 += 2 * bar
        k += 1

    # 2. Pad cálido muy sutil (cuerpo armónico)
    pad = np.zeros(N, dtype=np.float64)
    t0 = a.entrada
    k = 0
    while t0 < a.fin:
        ch = acordes[k % 4]
        i0 = int(t0 * SR)
        i1 = min(N, int((t0 + 2 * bar + 0.6) * SR))
        tt = t[i0:i1] - t0
        env = np.minimum(1.0, tt / 0.8) * np.minimum(1.0, (tt[-1] - tt) / 0.9)
        s = sum(np.sin(2 * np.pi * midi(n) * tt) for n in ch[:4]) / 4.0
        pad[i0:i1] += s * env * 0.11
        t0 += 2 * bar
        k += 1
    pad = lowpass_fft(pad, 750.0)

    # 3. Pulso percusivo orgánico y bajo cálido (desde --entrada hasta --fin)
    bajo = np.zeros(N, dtype=np.float64)
    kick = np.zeros(N, dtype=np.float64)
    brush = np.zeros(N, dtype=np.float64)
    b = a.entrada
    beat_idx = 0
    while b < a.fin - 0.1:
        i0 = int(b * SR)
        # Bombo cálido en tiempos 1 y 3 (o suave en cada negra tras el segundo 66)
        if beat_idx % 2 == 0 or b >= 66.0:
            ln = min(N - i0, int(0.28 * SR))
            tt = np.arange(ln) / SR
            fr = 46 + 52 * np.exp(-tt * 28)
            kick[i0 : i0 + ln] += np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt * 10) * (0.20 if beat_idx % 2 == 0 else 0.10)
        # Bajo redondo en tiempo 1 de cada compás
        if beat_idx % 4 == 0:
            root = raices[int(((b - a.entrada) // (2 * bar))) % 4]
            ln2 = min(N - i0, int(bar * 0.9 * SR))
            tt2 = np.arange(ln2) / SR
            bajo[i0 : i0 + ln2] += np.sin(2 * np.pi * midi(root) * tt2) * np.minimum(1.0, tt2 / 0.04) * np.exp(-tt2 * 0.8) * 0.14
        # Escobilla / shaker muy tenue a contratiempo
        j0 = int((b + BEAT * 0.5) * SR)
        ln3 = min(N - j0, int(0.045 * SR))
        if ln3 > 0:
            nz = rng.standard_normal(ln3)
            brush[j0 : j0 + ln3] += nz * np.exp(-np.arange(ln3) / SR * 65) * 0.018
        b += BEAT
        beat_idx += 1

    mix = piano + pad + kick + bajo + brush

    # 4. Acorde final cálido y abierto sobre el cierre de MURO
    ln_fin = N - fin_i
    if ln_fin > 0:
        for idx, note in enumerate([38, 50, 57, 61, 66, 69]):
            st = fin_i + int(idx * 0.06 * SR)
            if st >= N:
                break
            nt = felt_note(midi(note), (N - st) / SR, vel=0.16)
            mix[st : st + len(nt)] += nt

    # 5. Ducking suave durante el testimonio de Laura Zapata
    env_duck = np.ones(N, dtype=np.float64)
    if a.duck_fin > a.duck_ini:
        d0, d1 = int(a.duck_ini * SR), int(a.duck_fin * SR)
        fade = int(0.8 * SR)
        env_duck[d0:d1] = 0.62
        if d0 > fade:
            env_duck[d0 - fade : d0] = np.linspace(1.0, 0.62, fade)
        if d1 + fade < N:
            env_duck[d1 : d1 + fade] = np.linspace(0.62, 1.0, fade)
    mix *= env_duck

    # 6. Reverb cálida de estudio (convolución FFT) + imagen estéreo sutil
    ir_n = int(1.8 * SR)
    ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR * 2.8)
    ir = lowpass_fft(ir, 3200.0)
    ir /= np.sqrt((ir ** 2).sum()) + 1e-12
    nfft = 1 << int(np.ceil(np.log2(N + ir_n)))
    wet = np.fft.irfft(np.fft.rfft(mix, nfft) * np.fft.rfft(ir, nfft), nfft)[:N]
    L = mix + 0.30 * wet
    R = mix + 0.30 * np.roll(wet, int(0.013 * SR))
    st = np.stack([L, R], axis=1)
    st *= np.minimum(1.0, t / 0.8)[:, None]
    st *= np.minimum(1.0, (a.dur - t) / 1.8).clip(0)[:, None]
    peak = np.abs(st).max()
    if peak > 0:
        st /= peak / 0.88

    out = Path(a.salida)
    out.parent.mkdir(parents=True, exist_ok=True)
    sf.write(out, st.astype(np.float32), SR)
    print(f"cama musical: {out} ({a.dur:.1f}s)")


if __name__ == "__main__":
    main()
