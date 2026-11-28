import React from 'react'
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion'
import { clamp, ramp } from './components'
import { SCENES } from './scenes'
import { Subtitles } from './Subtitles'
import { C, FPS, loadFonts } from './theme'
import { LineaPlan, Plan, XF } from './timing'

loadFonts()

/** Transición ágil con corte cinético + barrido lateral rápido (8 frames). */
const Shell: React.FC<{ len: number; first: boolean; last: boolean; children: React.ReactNode }> = ({
  len,
  first,
  last,
  children,
}) => {
  const f = useCurrentFrame()
  const e = first ? 1 : ramp(f, 0, XF)
  const x = last ? 0 : ramp(f, len - XF, len)
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(e, 1 - x),
        transform: `translateX(${(1 - e) * 80 - x * 80}px) scale(${0.97 + 0.03 * Math.min(e, 1 - x)})`,
      }}
    >
      {children}
    </AbsoluteFill>
  )
}

/** Cortina dorada rápida (wipe editorial de 10 frames) entre cambios de bloque para dar ritmo y energía. */
const GoldWipe: React.FC = () => {
  const f = useCurrentFrame()
  const x = interpolate(f, [0, 5, 10], [-100, 0, 100], clamp)
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 55, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: C.ac,
          transform: `translateX(${x}%)`,
          opacity: 0.92,
        }}
      />
    </AbsoluteFill>
  )
}

const Progress: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame()
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        height: 5,
        width: `${(100 * f) / Math.max(1, total)}%`,
        background: C.ac,
        zIndex: 60,
      }}
    />
  )
}

export const MuroVideo: React.FC<{ plan: Plan; subs: LineaPlan[]; hasMusic: boolean }> = ({ plan, subs, hasMusic }) => {
  const { scenes, lines, total } = plan
  const half = XF / 2

  return (
    <AbsoluteFill style={{ background: C.asfalto }}>
      {scenes.map((s, i) => {
        const Scene = SCENES[s.id]
        if (!Scene) return null
        const first = i === 0
        const last = i === scenes.length - 1
        const from = first ? 0 : s.from - half
        const len = s.dur + (first ? 0 : half) + (last ? 0 : half)
        const lead = Math.round(lines[i].start * FPS) - from
        return (
          <Sequence key={s.id} from={from} durationInFrames={len} name={s.id}>
            <Shell len={len} first={first} last={last}>
              <Scene dur={len} line={lines[i]} lead={lead} />
            </Shell>
          </Sequence>
        )
      })}

      {/* Wipe dorado rápido entre bloques */}
      {scenes.slice(1).map((s, idx) => {
        const prev = scenes[idx]
        if (s.bloque === prev.bloque) return null
        return (
          <Sequence key={'wp-' + s.id} from={Math.max(0, s.from - 5)} durationInFrames={10} name={'wipe ' + s.id}>
            <GoldWipe />
          </Sequence>
        )
      })}

      <Subtitles lines={subs} />
      <Progress total={total} />

      {lines.map((l) =>
        l.archivo ? (
          <Sequence key={'vo-' + l.id} from={Math.round(l.start * FPS)} name={'voz ' + l.id}>
            <Audio src={staticFile(l.archivo)} volume={1} />
          </Sequence>
        ) : null,
      )}

      {hasMusic ? (
        <Audio
          src={staticFile('musica/cama-es.wav')}
          volume={(f) => 0.30 * interpolate(f, [0, 12, total - 42, total], [0, 1, 1, 0], clamp)}
        />
      ) : null}

      {scenes.slice(1).map((s, idx) => {
        const prev = scenes[idx]
        if (s.bloque === prev.bloque) return null
        return (
          <Sequence key={'sw-' + s.id} from={Math.max(0, s.from - 6)} durationInFrames={24} name={'swish ' + s.id}>
            <Audio src={staticFile('sfx/swish-suave.wav')} volume={0.42} />
          </Sequence>
        )
      })}
    </AbsoluteFill>
  )
}
