import { FPS } from './theme'

export type Palabra = { w: string; s: number; e: number }
export type Linea = {
  id: string
  bloque?: string
  pausa_despues?: number
  texto: string
  archivo: string | null
  duracion: number
  palabras: Palabra[]
}
export type Voz = { lang: string; lineas: Linea[] }

export type LineaPlan = Linea & { start: number } // segundos absolutos
export type Escena = { id: string; bloque: string; from: number; dur: number } // frames
export type Plan = { lines: LineaPlan[]; scenes: Escena[]; total: number }

const LEAD = 0.6     // respiro inicial en el plano del bar
const DEFAULT_GAP = 0.45
const TAIL = 3.2     // hold final sobre el wordmark MURO y la URL
const PRE = 0.12     // la escena entra ligeramente antes de su primera palabra
export const XF = 10 // frames de solapamiento en la transición

export function plan(v: Voz): Plan {
  let t = LEAD
  const lines = v.lineas.map((l) => {
    const start = t
    const gap = l.pausa_despues ?? DEFAULT_GAP
    t += l.duracion + gap
    return { ...l, start }
  })
  const last = lines[lines.length - 1]
  const end = last.start + last.duracion + TAIL
  const bounds = lines.map((l, i) => (i === 0 ? 0 : l.start - PRE))
  const scenes = lines.map((l, i) => {
    const from = Math.round(bounds[i] * FPS)
    const to = Math.round((i < lines.length - 1 ? bounds[i + 1] : end) * FPS)
    return { id: l.id, bloque: l.bloque ?? '', from, dur: Math.max(1, to - from) }
  })
  return { lines, scenes, total: Math.round(end * FPS) }
}
