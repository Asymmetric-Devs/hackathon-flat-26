# Video demo de Muro (Remotion · FLAT Stellar 2026)

Pipeline 100 % local para producir el video oficial de **Muro** (1920×1080, 30 fps, ~02:30, basado en [`docs/guion-video.md`](../docs/guion-video.md)):

- **Montaje y animación:** Remotion 4 + React 19 + TypeScript (`src/`).
- **Capturas reales de la app:** Playwright grabando tanto pantallas estáticas (`scripts/capture.mjs`) como clips de video fluidos a 30 fps (`scripts/capture-clips.mjs`).
- **Locución local (Apple Silicon):** Chatterbox Multilingual V3 (`ResembleAI/Chatterbox-Multilingual-es-mx-latam`) con referencias nativas de español de Argentina (OpenSLR `SLR61`, CC BY-SA 4.0) y selección automática de la mejor toma + timestamps palabra por palabra mediante `mlx-whisper` (`tts/voz.py`).
- **Música a medida:** cama musical cálida a 114 BPM sintetizada localmente con *ducking* en el testimonio de Laura Zapata y resolución en el cierre (`tts/musica.py`).

> Los archivos generados (`out/`, `public/clips/`, `public/capturas/`, `public/voz/`, `public/musica/`, `tts/cache/`, `tts/voces/`) están ignorados en `.gitignore`.

## Estructura

| Ruta | Descripción |
|---|---|
| `guion.json` | Guion por bloques (`texto` para subtítulos y `habla` para pronunciación TTS). |
| `src/scenes.tsx` | Escenas dinámicas (cortes rápidos, clips 30 fps con `<OffthreadVideo>`, placas editoriales). |
| `src/Video.tsx` | Composición principal, transiciones (*wipe* dorado), barra de progreso, voz, música y SFX. |
| `src/Subtitles.tsx` | Subtítulos sincronizados palabra por palabra estilo cartela de Muro. |
| `src/timing.ts` | Cálculo de tiempos por línea a partir de `src/data/voz-es.json`. |
| `scripts/capture.mjs` | Captura stills de `/publicar`, `/obra/1`, `/obra/2`, `/cartela/0`, `/evidencia`, Stellar Expert y footer. |
| `scripts/capture-clips.mjs` | Graba clips reales a 30 fps (`intro`, `pregunta`, `como`, `cuotas`, `pared`, `obra0`). |
| `scripts/storyboard.mjs` | Genera una grilla 4×3 (`out/storyboard.png`) con 12 cuadros clave para revisar diseño sin renderizar el MP4. |
| `scripts/build-video.sh` | Ejecuta el pipeline completo de punta a punta. |
| `tts/referencias.py` | Descarga referencias de voz nativas (OpenSLR `SLR61`) y genera muestras en `tts/voces/muestras/`. |
| `tts/voz.py` | Genera tomas, elige la mejor con Whisper, normaliza a −16 LUFS y exporta `out/preview-voz-<ref>.wav`. |
| `tts/musica.py` | Sintetiza `public/musica/cama-es.wav` ajustada a la duración exacta de la locución. |

## Requisitos

- Node 20+, `ffmpeg`, `uv` (para Python 3.11) y Mac con Apple Silicon (para Chatterbox + `mlx-whisper`).
- Chrome/Chromium instalado (o `npx playwright install chromium` / variable `CHROME_BIN`).

## Cómo continuar o regenerar el video

```bash
cd video
npm install

# Entorno Python para voz y música (solo la primera vez)
uv venv -p 3.11 tts/.venv-chatterbox
uv pip install -p tts/.venv-chatterbox/bin/python \
  "chatterbox-tts @ git+https://github.com/resemble-ai/chatterbox.git@5de7a54aa4e5e2baadb0182dde554908b48b85c2" \
  mlx-whisper librosa soundfile remotezip

# 1. Capturas de la app viva (se puede pasar otra URL como primer argumento)
node scripts/capture.mjs https://muro.asymmetric.com.ar/
node scripts/capture-clips.mjs https://muro.asymmetric.com.ar/

# 2. Referencias de voz y locución (ejemplo con ar_m_01523)
tts/.venv-chatterbox/bin/python tts/referencias.py
tts/.venv-chatterbox/bin/python tts/voz.py es --tomas 2 --ref ar_m_01523

# 3. Música a medida + render final (o correr todo junto con scripts/build-video.sh)
bash scripts/build-video.sh ar_m_01523 2

# 4. Herramientas de iteración rápida
npm run studio        # Editor visual de Remotion en el navegador
npm run storyboard    # Grilla 4x3 en out/storyboard.png
npm run render        # Render directo de out/muro-es.mp4
```
