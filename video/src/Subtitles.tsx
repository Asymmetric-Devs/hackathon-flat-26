import React from 'react'
import { useCurrentFrame } from 'remotion'
import { C, F, FPS } from './theme'
import type { LineaPlan, Palabra } from './timing'
import { ramp } from './components'

type Chunk = { words: Palabra[]; start: number; end: number }

function chunks(lines: LineaPlan[]): Chunk[] {
  const out: Chunk[] = []
  for (const l of lines) {
    const ws: Palabra[] = []
    for (const w of l.palabras) {
      const prev = ws[ws.length - 1]
      if (prev && /^[%.,:;!?]+$/.test(w.w)) {
        ws[ws.length - 1] = { w: prev.w + (w.w.startsWith('%') ? ' ' : '') + w.w, s: prev.s, e: w.e }
      } else {
        ws.push({ ...w })
      }
    }
    // Frases cortas (≈6 palabras) para que el subtítulo sea una sola línea corta y no tape la imagen
    const k = Math.max(1, Math.ceil(ws.length / 6))
    const size = ws.length / k
    let cur: Palabra[] = []
    const flush = () => {
      if (cur.length) {
        out.push({
          words: cur.map((w) => ({ ...w, s: l.start + w.s, e: l.start + w.e })),
          start: 0,
          end: 0,
        })
      }
      cur = []
    }
    ws.forEach((w, i) => {
      cur.push(w)
      const left = ws.length - i - 1
      const punct = /[,:.;!?]$/.test(w.w)
      if (left === 0 || (left >= 2 && ((punct && cur.length >= 3) || cur.length >= Math.round(size)))) flush()
    })
  }
  out.forEach((c, i) => {
    c.start = c.words[0].s - 0.06
    const nxt = out[i + 1]
    const lastE = c.words[c.words.length - 1].e
    c.end = nxt && nxt.words[0].s - lastE < 0.5 ? nxt.words[0].s - 0.04 : lastE + 0.3
  })
  return out
}

/**
 * Subtítulo simple: una línea corta en la fuente de la app (Geist), sobre una cinta de tinta apenas translúcida.
 * La palabra que se dice va en dorado de Muro; el resto, en papel. Sin cintas adhesivas ni sombras duras.
 */
export const Subtitles: React.FC<{ lines: LineaPlan[] }> = ({ lines }) => {
  const f = useCurrentFrame()
  const t = f / FPS
  const list = React.useMemo(() => chunks(lines), [lines])
  const c = list.find((x) => t >= x.start && t < x.end)
  if (!c) return null
  const a = Math.round(c.start * FPS)
  const p = ramp(f, a, a + 5)
  const out = ramp(f, Math.round(c.end * FPS) - 3, Math.round(c.end * FPS))
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 44, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 45 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: '0.28em',
          maxWidth: 1300,
          padding: '9px 22px 10px',
          borderRadius: 8,
          background: 'rgba(13, 16, 36, 0.72)',
          font: `500 29px/1.25 ${F.sans}`,
          letterSpacing: '-0.005em',
          opacity: p * (1 - out),
          transform: `translateY(${(1 - p) * 8}px)`,
        }}
      >
        {c.words.map((w, i) => {
          const on = t >= w.s - 0.03
          const active = on && t < w.e + 0.05
          return (
            <span key={i} style={{ color: active ? C.ac : on ? C.papel : 'rgba(253, 251, 244, 0.5)' }}>
              {w.w}
            </span>
          )
        })}
      </div>
    </div>
  )
}
