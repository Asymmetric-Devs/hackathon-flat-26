import React from 'react'
import { Easing, interpolate, useCurrentFrame } from 'remotion'
import { WM } from './wordmarkData'
import { C } from './theme'

/**
 * El logotipo de Muro tal como se pinta en la intro de la app: cada letra se pinta con un trazo de
 * pincel en zigzag y después chorrea. Mismo trazado (wordmarkData.ts) y mismos chorreados que la web.
 */
const DRIPS = [
  { x: 215, len: 400, w: 112, o: false },
  { x: 1953, len: 560, w: 124, o: false },
  { x: 3195, len: 270, w: 108, o: false },
  { x: 3690, len: 480, w: 118, o: true },
  { x: 4010, len: 210, w: 100, o: true },
]
function dripPath(cx: number, len: number, w: number) {
  const r = w * 0.74, by = len - r, yn = by - r * 1.55, y0 = -90, h = w / 2, hn = w * 0.4
  return `M${cx - h} ${y0} L${cx - h} ${yn - 40} Q${cx - hn} ${yn} ${cx - hn} ${by - r * 1.05} Q${cx - hn} ${by - r * 0.75} ${cx - r} ${by} A${r} ${r} 0 0 0 ${cx + r} ${by} Q${cx + hn} ${by - r * 0.75} ${cx + hn} ${by - r * 1.05} Q${cx + hn} ${yn} ${cx + h} ${yn - 40} L${cx + h} ${y0} Z`
}
const DRIP_ROOM = 760

function brush(x0: number, x1: number) {
  const L = x0 - 110, R = x1 + 110
  const ys = [0, 1, 2, 3, 4].map((k) => -WM.cap + 200 + k * 320)
  let d = `M${L} ${ys[0]}`
  ys.forEach((y, k) => {
    const x = k % 2 === 0 ? R : L
    d += ` L${x} ${y}`
    if (k < 4) d += ` L${x} ${ys[k + 1]}`
  })
  return d
}

const ease = Easing.inOut(Easing.cubic)
const easeOut = Easing.out(Easing.quad)

export const PaintedWordmark: React.FC<{
  /** frame (de la escena) en que empieza a pintarse */
  at?: number
  /** ancho en px */
  width?: number
  ink?: string
  gold?: string
  drips?: boolean
  style?: React.CSSProperties
}> = ({ at = 0, width = 1180, ink = C.asfalto, gold = C.ac, drips = true, style }) => {
  const f = useCurrentFrame() - at
  const h = WM.cap + (drips ? DRIP_ROOM : 60)
  return (
    <svg viewBox={`0 ${-WM.cap} ${WM.w} ${h}`} width={width} height={(width * h) / WM.w} style={{ overflow: 'visible', ...style }}>
      <defs>
        <clipPath id="wmDripClip">
          <rect x={-60} y={-70} width={WM.w + 120} height={900} />
        </clipPath>
        {WM.letters.map((l, i) => {
          const p = interpolate(f, [7 + i * 6, 7 + i * 6 + 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease })
          return (
            <mask key={l.ch} id={`wmM${i}`} maskUnits="userSpaceOnUse" x={l.x0 - 160} y={-WM.cap - 120} width={l.x1 - l.x0 + 320} height={WM.cap + 300}>
              <path d={brush(l.x0, l.x1)} fill="none" stroke="#fff" strokeWidth={380} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
            </mask>
          )
        })}
      </defs>
      <g>
        {WM.letters.map((l, i) => (
          <path key={l.ch} d={l.d} fill={i === 3 ? gold : ink} mask={`url(#wmM${i})`} />
        ))}
        {drips ? (
          <g clipPath="url(#wmDripClip)">
            {DRIPS.map((d, i) => {
              const p = interpolate(f, [44 + i * 4, 44 + i * 4 + 36], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut })
              return (
                <g key={i} transform={`translate(0 ${-(d.len + 80) * (1 - p)})`} opacity={p > 0 ? 1 : 0}>
                  <path d={dripPath(d.x, d.len, d.w)} fill={d.o ? gold : ink} />
                </g>
              )
            })}
          </g>
        ) : null}
      </g>
    </svg>
  )
}
