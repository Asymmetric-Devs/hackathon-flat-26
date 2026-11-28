import React from 'react'
import { useCurrentFrame } from 'remotion'
import { C, F, FPS } from './theme'
import type { LineaPlan, Palabra } from './timing'
import { Tape, ramp } from './components'

type Chunk = { words: Palabra[]; start: number; end: number }

function chunks(lines: LineaPlan[]): Chunk[] {
  const out: Chunk[] = []
  for (const l of lines) {
    const ws: Palabra[] = []
    for (const w of l.palabras) {
      const prev = ws[ws.length - 1]
      if (prev && /^[%.,:;!?]+$/.test(w.w)) {
        ws[ws.length - 1] = { w: prev.w + (w.w.startsWith('%') ? '\u202f' : '') + w.w, s: prev.s, e: w.e }
      } else {
        ws.push({ ...w })
      }
    }
    const k = Math.max(1, Math.ceil(ws.length / 8))
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
      if (left === 0 || (left >= 3 && ((punct && cur.length >= 3) || cur.length >= Math.round(size)))) flush()
    })
  }
  out.forEach((c, i) => {
    c.start = c.words[0].s - 0.08
    const nxt = out[i + 1]
    const lastE = c.words[c.words.length - 1].e
    c.end = nxt && nxt.words[0].s - lastE < 0.55 ? nxt.words[0].s - 0.08 : lastE + 0.35
  })
  return out
}

/** Subtítulo estilo cartela de museo de Muro: papel crema (#fdfbf4), borde tinta,
 * sombra dura editorial, cinta adhesiva en las esquinas y resaltado dorado (#e8d282) palabra por palabra. */
export const Subtitles: React.FC<{ lines: LineaPlan[] }> = ({ lines }) => {
  const f = useCurrentFrame()
  const t = f / FPS
  const list = React.useMemo(() => chunks(lines), [lines])
  const c = list.find((x) => t >= x.start && t < x.end)
  if (!c) return null
  const a = Math.round(c.start * FPS)
  const p = ramp(f, a, a + 6)
  const out = ramp(f, Math.round(c.end * FPS) - 4, Math.round(c.end * FPS))
  return (
    <div style={{ position: 'absolute', left: 64, right: 64, bottom: 38, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 45 }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          columnGap: '0.24em',
          rowGap: 6,
          maxWidth: 1460,
          padding: '15px 32px 16px',
          borderRadius: 4,
          background: C.papel,
          border: `2.5px solid ${C.asfalto}`,
          boxShadow: '6px 6px 0 rgba(13, 16, 36, 0.92), 0 22px 44px -18px rgba(13, 16, 36, 0.55)',
          font: `600 35px/1.2 ${F.sans}`,
          letterSpacing: '-0.012em',
          opacity: p * (1 - out),
          transform: `rotate(-0.45deg) translateY(${(1 - p) * 14}px) scale(${0.97 + 0.03 * p})`,
        }}
      >
        <Tape w={56} h={16} rot={-8} style={{ top: -9, left: 18 }} />
        <Tape w={56} h={16} rot={7} style={{ top: -9, right: 18 }} />
        {c.words.map((w, i) => {
          const on = t >= w.s - 0.03
          const active = on && t < w.e + 0.06
          return (
            <span
              key={i}
              style={{
                position: 'relative',
                padding: '1px 6px',
                borderRadius: 4,
                background: active ? C.ac : 'transparent',
                color: active ? C.on : on ? C.tinta : 'rgba(13, 16, 36, 0.36)',
                transition: 'none',
              }}
            >
              {w.w}
            </span>
          )
        })}
      </div>
    </div>
  )
}
