import React from 'react'
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { C, F, FPS, H, W } from './theme'

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
export const EASE = Easing.bezier(0.22, 1, 0.36, 1)
export const EASE_IO = Easing.bezier(0.65, 0, 0.35, 1)

export function ramp(frame: number, a: number, b: number, ease = EASE) {
  return interpolate(frame, [a, b], [0, 1], { ...clamp, easing: ease })
}
export function pop(frame: number, at: number, damping = 13, mass = 0.65) {
  return spring({ frame: frame - at, fps: FPS, config: { damping, mass, stiffness: 190 } })
}
export const sec = (s: number) => Math.round(s * FPS)

export function useScene() {
  const f = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  return { f, dur: durationInFrames }
}

// ------------------------------------------------------------------ fondos de Muro
export const PaperBg: React.FC<{ tone?: 'crema' | 'papel'; children?: React.ReactNode }> = ({
  tone = 'crema',
  children,
}) => {
  const f = useCurrentFrame()
  return (
    <AbsoluteFill style={{ background: tone === 'crema' ? C.crema : C.papel }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(rgba(13,16,36,0.085) 1.2px, transparent 1.4px)`,
          backgroundSize: '30px 30px',
          backgroundPosition: `${-f * 0.22}px ${-f * 0.1}px`,
          opacity: 0.6,
          maskImage: 'radial-gradient(ellipse 84% 78% at 50% 45%, #000 35%, transparent 100%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(60% 50% at 18% 22%, rgba(255,253,244,0.85), transparent 70%), radial-gradient(50% 45% at 84% 78%, rgba(232,210,130,0.24), transparent 70%)',
        }}
      />
      {children}
    </AbsoluteFill>
  )
}

export const AsphaltBg: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: C.asfalto }}>
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(55% 48% at 78% 18%, rgba(232,210,130,0.14), transparent 70%), radial-gradient(50% 50% at 15% 85%, rgba(253,251,244,0.05), transparent 70%)',
      }}
    />
    {children}
  </AbsoluteFill>
)

// ------------------------------------------------------------------ piezas gráficas nativas de Muro
/** Cinta adhesiva semitransparente inclinada (idéntica a .tape de Muro). */
export const Tape: React.FC<{ style?: React.CSSProperties; rot?: number; w?: number; h?: number }> = ({
  style,
  rot = -6,
  w = 88,
  h = 26,
}) => (
  <div
    style={{
      position: 'absolute',
      width: w,
      height: h,
      background: C.tape,
      boxShadow: '0 2px 4px rgba(13,16,36,0.24)',
      transform: `rotate(${rot}deg)`,
      pointerEvents: 'none',
      zIndex: 8,
      ...style,
    }}
  />
)

/** Sticker circular dorado rotado con rebote elástico (idéntico a .dot de Muro). */
export const StickerDot: React.FC<{
  big: string
  small?: string
  at: number
  size?: number
  rot?: number
  style?: React.CSSProperties
}> = ({ big, small, at, size = 126, rot = 9, style }) => {
  const f = useCurrentFrame()
  const s = pop(f, at, 11, 0.6)
  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: C.ac,
        color: C.on,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: '0 14px 26px -8px rgba(13,16,36,0.55), 0 0 0 2.5px rgba(13,16,36,0.9)',
        transform: `rotate(${rot}deg) scale(${s})`,
        opacity: interpolate(s, [0, 0.2], [0, 1], clamp),
        zIndex: 15,
        ...style,
      }}
    >
      <div style={{ font: `900 ${Math.round(size * 0.44)}px/0.86 ${F.display}`, letterSpacing: '-0.01em' }}>{big}</div>
      {small ? (
        <div style={{ marginTop: 3, font: `700 ${Math.round(size * 0.13)}px/1 ${F.mono}`, textTransform: 'uppercase' }}>
          {small}
        </div>
      ) : null}
    </div>
  )
}

/** Anotación gestual en Permanent Marker + flecha dibujada a mano (idéntica a .note de Muro). */
export const HandNote: React.FC<{
  text: string
  at: number
  dark?: boolean
  rot?: number
  arrow?: 'right' | 'left' | 'down' | 'none'
  style?: React.CSSProperties
}> = ({ text, at, dark = false, rot = -4, arrow = 'right', style }) => {
  const f = useCurrentFrame()
  const p = ramp(f, at, at + 14)
  const draw = ramp(f, at + 6, at + 22)
  const col = dark ? C.ac : C.tinta
  return (
    <div
      style={{
        position: 'absolute',
        font: `400 32px/1.08 ${F.marker}`,
        color: col,
        transform: `rotate(${rot}deg) translateY(${(1 - p) * 14}px)`,
        opacity: p,
        pointerEvents: 'none',
        zIndex: 16,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {text}
      {arrow !== 'none' ? (
        <svg
          width="86"
          height="54"
          viewBox="0 0 86 54"
          style={{
            position: 'absolute',
            left: arrow === 'left' ? -72 : arrow === 'down' ? '38%' : '102%',
            top: arrow === 'down' ? '100%' : 6,
            overflow: 'visible',
          }}
        >
          {arrow === 'right' ? (
            <path
              d="M4 18 Q 42 4, 76 30 M 64 16 L 78 32 L 58 36"
              fill="none"
              stroke={col}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="160"
              strokeDashoffset={160 * (1 - draw)}
            />
          ) : arrow === 'left' ? (
            <path
              d="M82 18 Q 44 4, 10 30 M 22 16 L 8 32 L 28 36"
              fill="none"
              stroke={col}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="160"
              strokeDashoffset={160 * (1 - draw)}
            />
          ) : (
            <path
              d="M24 4 Q 36 26, 20 48 M 10 36 L 19 50 L 33 40"
              fill="none"
              stroke={col}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="160"
              strokeDashoffset={160 * (1 - draw)}
            />
          )}
        </svg>
      ) : null}
    </div>
  )
}

/** Resaltador dorado tipo marcador (<mark> de Muro) que barre detrás del texto. */
export const MarkText: React.FC<{ children: React.ReactNode; at: number; style?: React.CSSProperties }> = ({
  children,
  at,
  style,
}) => {
  const f = useCurrentFrame()
  const w = ramp(f, at, at + 14)
  return (
    <span style={{ position: 'relative', display: 'inline-block', padding: '2px 14px', ...style }}>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          background: C.ac,
          transformOrigin: 'left center',
          transform: `scaleX(${w})`,
          zIndex: 0,
        }}
      />
      <span style={{ position: 'relative', zIndex: 1, color: C.on }}>{children}</span>
    </span>
  )
}

export const Rise: React.FC<{
  text: string
  at: number
  stagger?: number
  style?: React.CSSProperties
  dur?: number
}> = ({ text, at, stagger = 2, style, dur = 14 }) => {
  const f = useCurrentFrame()
  const words = text.split(' ')
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '0.24em', ...style }}>
      {words.map((w, i) => {
        const p = ramp(f, at + i * stagger, at + i * stagger + dur)
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: '0.08em', marginBottom: '-0.08em' }}>
            <span style={{ display: 'inline-block', transform: `translateY(${(1 - p) * 118}%)`, opacity: interpolate(p, [0, 0.25], [0, 1], clamp) }}>
              {w}
            </span>
          </span>
        )
      })}
    </div>
  )
}

export const Kicker: React.FC<{
  children: React.ReactNode
  at: number
  dark?: boolean
  style?: React.CSSProperties
}> = ({ children, at, dark = false, style }) => {
  const f = useCurrentFrame()
  const p = ramp(f, at, at + 12)
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        font: `600 22px/1 ${F.mono}`,
        letterSpacing: '.14em',
        textTransform: 'uppercase',
        color: dark ? C.ac : C.tinta2,
        opacity: p,
        transform: `translateX(${(1 - p) * -18}px)`,
        ...style,
      }}
    >
      <span style={{ width: 10, height: 10, background: C.ac, borderRadius: 2, transform: `scale(${p})` }} />
      {children}
    </div>
  )
}

/** Etiqueta editorial de cartela (papel o tinta sólida, siempre 100 % legible). */
export const CartelaTag: React.FC<{
  children: React.ReactNode
  at: number
  variant?: 'gold' | 'ink' | 'paper'
  rot?: number
  style?: React.CSSProperties
}> = ({ children, at, variant = 'gold', rot = -0.8, style }) => {
  const f = useCurrentFrame()
  const s = pop(f, at)
  const bg = variant === 'gold' ? C.ac : variant === 'ink' ? C.asfalto : C.papel
  const fg = variant === 'gold' ? C.on : variant === 'ink' ? C.ac : C.tinta
  const bd = variant === 'ink' ? `2px solid ${C.ac}` : `2px solid ${C.asfalto}`
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 20px',
        borderRadius: 6,
        background: bg,
        border: bd,
        boxShadow: '4px 4px 0 rgba(13,16,36,0.9)',
        font: `700 20px/1 ${F.mono}`,
        color: fg,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        opacity: interpolate(s, [0, 0.35], [0, 1], clamp),
        transform: `rotate(${rot}deg) translateY(${(1 - s) * 18}px) scale(${0.92 + 0.08 * s})`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ------------------------------------------------------------------ capturas de la app (sin ghosting)
export const Seq: React.FC<{
  dir: string
  n: number
  durFrames: number
  from?: number
  to?: number
  start?: number
  crossfade?: boolean
  style?: React.CSSProperties
}> = ({ dir, n, durFrames, from = 0, to, start = 0, crossfade = false, style }) => {
  const f = useCurrentFrame()
  const end = to ?? n - 1
  const pos = interpolate(f - start, [0, Math.max(1, durFrames)], [from, end], clamp)
  const a = Math.max(0, Math.min(n - 1, Math.round(pos)))
  const b = Math.min(n - 1, Math.floor(pos) + 1)
  const t = pos - Math.floor(pos)
  const src = (i: number) => staticFile(`${dir}/${String(i).padStart(3, '0')}.jpg`)
  const img: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style }
  if (!crossfade) {
    return <Img src={src(a)} style={img} />
  }
  const fa = Math.max(0, Math.min(n - 1, Math.floor(pos)))
  return (
    <>
      <Img src={src(fa)} style={img} />
      {t > 0.02 && b !== fa ? <Img src={src(b)} style={{ ...img, opacity: t }} /> : null}
    </>
  )
}

export type Region = { x: number; y: number; w: number }

export const Cam: React.FC<{ region: Region; vw: number; children: React.ReactNode }> = ({ region, vw, children }) => {
  const s = vw / region.w
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: W,
          height: H,
          transformOrigin: '0 0',
          transform: `translate(${-region.x * s}px, ${-region.y * s}px) scale(${s})`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export function lerpRegion(a: Region, b: Region, t: number): Region {
  const w = Math.exp(Math.log(a.w) + (Math.log(b.w) - Math.log(a.w)) * t)
  const k = a.w === b.w ? t : (w - a.w) / (b.w - a.w)
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, w }
}

export const WindowMuro: React.FC<{
  width: number
  title: string
  children: React.ReactNode
  style?: React.CSSProperties
}> = ({ width, title, children, style }) => {
  const bar = 42
  const h = (width * 9) / 16
  return (
    <div
      style={{
        position: 'absolute',
        width,
        height: h + bar,
        borderRadius: 16,
        overflow: 'hidden',
        background: C.papel,
        border: `2.5px solid ${C.asfalto}`,
        boxShadow: '12px 12px 0 rgba(232,210,130,0.45), 0 40px 80px rgba(0,0,0,0.55)',
        ...style,
      }}
    >
      <div
        style={{
          height: bar,
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          gap: 8,
          borderBottom: `1.5px solid ${C.hair}`,
          background: C.crema,
        }}
      >
        {['#D86E5C', '#E4B84A', '#62B36B'].map((col) => (
          <span key={col} style={{ width: 12, height: 12, borderRadius: 99, background: col, opacity: 0.9 }} />
        ))}
        <div style={{ flex: 1, textAlign: 'center', font: `600 15px/1 ${F.mono}`, color: C.tinta2, marginRight: 52 }}>
          {title}
        </div>
      </div>
      <div style={{ position: 'relative', width, height: h, overflow: 'hidden' }}>{children}</div>
    </div>
  )
}

export const PhoneFrame: React.FC<{
  height?: number
  children: React.ReactNode
  style?: React.CSSProperties
}> = ({ height = 820, children, style }) => {
  const width = Math.round((height * 390) / 844)
  return (
    <div
      style={{
        width: width + 22,
        height: height + 22,
        borderRadius: 46,
        padding: 11,
        background: C.asfalto,
        boxShadow: '0 36px 76px -22px rgba(13,16,36,0.45), 0 0 0 1px rgba(13,16,36,0.12)',
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 96,
          height: 22,
          borderRadius: 99,
          background: C.asfalto,
          zIndex: 10,
        }}
      />
      <div style={{ width, height, borderRadius: 38, overflow: 'hidden', position: 'relative', background: C.crema }}>
        {children}
      </div>
    </div>
  )
}

export const Ring: React.FC<{ x: number; y: number; w: number; h: number; at: number; color?: string; r?: number }> = ({
  x,
  y,
  w,
  h,
  at,
  color = C.ac,
  r = 12,
}) => {
  const f = useCurrentFrame()
  const s = pop(f, at, 13)
  const per = 2 * (w + h)
  return (
    <svg style={{ position: 'absolute', left: x - 8, top: y - 8, overflow: 'visible', zIndex: 20 }} width={w + 16} height={h + 16}>
      <rect
        x={8}
        y={8}
        width={w}
        height={h}
        rx={r}
        fill={`${color}18`}
        stroke={color}
        strokeWidth={4.5}
        strokeDasharray={per}
        strokeDashoffset={per * (1 - Math.min(1, s))}
        style={{ opacity: Math.min(1, s * 2) }}
      />
    </svg>
  )
}

export const AudioWave: React.FC<{ bars?: number; color?: string }> = ({ bars = 32, color = C.asfalto }) => {
  const f = useCurrentFrame()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 52 }}>
      {Array.from({ length: bars }).map((_, i) => {
        const phase = f * 0.24 + i * 0.65
        const h = 10 + Math.abs(Math.sin(phase) * Math.cos(phase * 0.43 + i)) * 38
        return <span key={i} style={{ width: 5, height: h, borderRadius: 4, background: color, opacity: 0.9 }} />
      })}
    </div>
  )
}
