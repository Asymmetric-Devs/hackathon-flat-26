import React from 'react'
import { interpolate } from 'remotion'
import { clamp, pop, ramp, useScene } from './components'
import { C, F, FPS } from './theme'
import type { LineaPlan } from './timing'

/** Normaliza una palabra para buscarla en la locución (sin tildes, mayúsculas ni signos). */
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')

/**
 * Frame (relativo al inicio de la escena) en que se dice una palabra de la línea.
 * Así las cosas aparecen justo cuando la voz las nombra, aunque cambie la voz o el ritmo.
 * `nth` elige la ocurrencia (0 = la primera). Si no la encuentra, usa `fallback`.
 */
export function wordFrame(line: LineaPlan, lead: number, word: string, fallback: number, nth = 0): number {
  const hits = line.palabras.filter((p) => norm(p.w) === norm(word))
  const w = hits[nth]
  return w ? Math.max(0, lead + Math.round(w.s * FPS)) : fallback
}

/** Trazo hecho a mano: una línea que se dibuja sola, con extremos redondeados (marcador). */
export const HandPath: React.FC<{
  d: string
  at: number
  len?: number
  color?: string
  w?: number
  opacity?: number
}> = ({ d, at, len = 20, color = C.tinta, w = 4.5, opacity = 1 }) => {
  const { f } = useScene()
  const p = ramp(f, at, at + len)
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - p}
      opacity={p > 0 ? opacity : 0}
    />
  )
}

/** Capa SVG a pantalla completa para los trazos (coordenadas de 1920 × 1080). */
export const HandLayer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg
    viewBox="0 0 1920 1080"
    width={1920}
    height={1080}
    style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', zIndex: 6 }}
  >
    {children}
  </svg>
)

/** Etiqueta de cartela: rótulo chico en mono + valor grande, papel con cinta (como en la app). */
export const NumTag: React.FC<{
  label: string
  value: string
  unit?: string
  note?: string
  at: number
  x: number
  y: number
  w?: number
  rot?: number
  vs?: number
}> = ({ label, value, unit, note, at, x, y, w = 520, rot = 0, vs = 104 }) => {
  const { f } = useScene()
  const s = pop(f, at, 13, 0.6)
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        padding: '22px 30px 24px',
        background: C.papel,
        borderRadius: 4,
        boxShadow: '0 1px 0 rgba(13,16,36,.06), 0 24px 40px -22px rgba(13,16,36,.55)',
        transform: `rotate(${rot}deg) translateY(${(1 - s) * 34}px) scale(${0.94 + 0.06 * s})`,
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        zIndex: 10,
      }}
    >
      <div style={{ position: 'absolute', top: -11, left: 26, width: 78, height: 22, background: C.tape, transform: 'rotate(-4deg)', boxShadow: '0 2px 4px rgba(13,16,36,.2)' }} />
      <div style={{ font: `600 19px/1 ${F.mono}`, letterSpacing: '.14em', textTransform: 'uppercase', color: C.gris }}>{label}</div>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span style={{ font: `900 ${vs}px/0.92 ${F.display}`, color: C.tinta, letterSpacing: '-0.005em' }}>{value}</span>
        {unit ? <span style={{ font: `700 34px/1 ${F.display}`, color: C.acInk, letterSpacing: '.02em' }}>{unit}</span> : null}
      </div>
      {note ? <div style={{ marginTop: 10, font: `450 24px/1.3 ${F.sans}`, color: C.tinta2 }}>{note}</div> : null}
    </div>
  )
}

/** Texto a mano alzada (Permanent Marker) que aparece con un leve trazo hacia arriba. */
export const Scrawl: React.FC<{
  at: number
  x: number
  y: number
  size?: number
  rot?: number
  color?: string
  children: React.ReactNode
}> = ({ at, x, y, size = 44, rot = -3, color = C.acInk, children }) => {
  const { f } = useScene()
  const p = ramp(f, at, at + 14)
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        font: `400 ${size}px/1.05 ${F.marker}`,
        color,
        whiteSpace: 'nowrap',
        opacity: p,
        transform: `rotate(${rot}deg) translateY(${(1 - p) * 16}px)`,
        zIndex: 12,
      }}
    >
      {children}
    </div>
  )
}
