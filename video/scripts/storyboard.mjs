// Genera un storyboard / contact-sheet (grilla 4x3 de cuadros clave del video)
// en pocos segundos sin renderizar el MP4 completo, para validar diseño y ritmo antes de exportar.
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(new URL('..', import.meta.url).pathname)
const TMP = resolve(ROOT, 'out/storyboard-frames')
const OUT = resolve(ROOT, 'out/storyboard.png')
mkdirSync(TMP, { recursive: true })

// Calculamos los cuadros representativos de cada escena a partir de src/data/voz-es.json (o fallback)
const FPS = 30
const vozPath = resolve(ROOT, 'src/data/voz-es.json')
const voz = JSON.parse(readFileSync(vozPath, 'utf8'))

const LEAD = 0.6
const PRE = 0.12
let t = LEAD
const lines = voz.lineas.map((l) => {
  const start = t
  t += l.duracion + (l.pausa_despues ?? 0.45)
  return { ...l, start }
})

// 12 momentos clave cubriendo los 7 bloques
const picks = [
  { id: 'b01_gancho', frac: 0.45, label: '01 · Gancho ($0 cobrados)' },
  { id: 'b01_muro', frac: 0.65, label: '01 · Intro MURO + Hero' },
  { id: 'b02_tres_numeros', frac: 0.55, label: '02 · La Pregunta (Van Gogh)' },
  { id: 'b02_colgar', frac: 0.55, label: '02 · Cómo se cuelga (4 pasos)' },
  { id: 'b02_cuotas', frac: 0.72, label: '02 · Simulador en cuotas' },
  { id: 'b03_laura', frac: 0.35, label: '03 · Validación Laura Zapata' },
  { id: 'b04_publicar', frac: 0.65, label: '04 · Publicar + La Pared' },
  { id: 'b04_ficha', frac: 0.55, label: '04 · Ficha Manet + Lupa 2.6x' },
  { id: 'b05_cartela', frac: 0.65, label: '05 · Cartela QR móvil' },
  { id: 'b05_curriculum', frac: 0.55, label: '05 · Currículum inmutable' },
  { id: 'b06_arquitectura', frac: 0.60, label: '06 · Stellar + Raven + Tests' },
  { id: 'b07_cierre', frac: 0.88, label: '07 · Modelo + Cierre MURO' },
]

const files = []
for (let i = 0; i < picks.length; i++) {
  const pk = picks[i]
  const idx = lines.findIndex((l) => l.id === pk.id)
  if (idx < 0) continue
  const fromS = idx === 0 ? 0 : lines[idx].start - PRE
  const toS = idx < lines.length - 1 ? lines[idx + 1].start - PRE : lines[idx].start + lines[idx].duracion + 3.2
  const frame = Math.round((fromS + (toS - fromS) * pk.frac) * FPS)
  const outPng = resolve(TMP, `f_${String(i).padStart(2, '0')}.png`)
  console.log(`Renderizando cuadro ${i + 1}/${picks.length}: ${pk.label} (frame ${frame})`)
  execFileSync('npx', ['remotion', 'still', 'MuroES', outPng, `--frame=${frame}`, '--scale=0.5'], {
    cwd: ROOT,
    stdio: 'inherit',
  })
  files.push(outPng)
}

// Armar grilla 4x3 con ffmpeg
const inputs = files.flatMap((f) => ['-i', f])
const filter =
  files.map((_, i) => `[${i}:v]scale=960:540,drawbox=x=0:y=0:w=960:h=540:color=0x0d1024@0.8:t=4[v${i}]`).join(';') +
  ';' +
  files.map((_, i) => `[v${i}]`).join('') +
  'xstack=inputs=12:layout=0_0|960_0|1920_0|2880_0|0_540|960_540|1920_540|2880_540|0_1080|960_1080|1920_1080|2880_1080[out]'

execFileSync('ffmpeg', ['-y', ...inputs, '-filter_complex', filter, '-map', '[out]', OUT], { stdio: 'inherit' })
console.log('\nStoryboard generado ->', OUT)
