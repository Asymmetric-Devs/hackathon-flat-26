import React from 'react'
import { Composition } from 'remotion'
import vozEs from './data/voz-es.json'
import { FPS, H, W } from './theme'
import { plan, type Voz } from './timing'
import { MuroVideo } from './Video'

const voz = vozEs as Voz
const p = plan(voz)
const hasMusic = Boolean(voz.lineas.some((l) => l.archivo))

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MuroES"
    component={MuroVideo}
    durationInFrames={p.total}
    fps={FPS}
    width={W}
    height={H}
    defaultProps={{ plan: p, subs: p.lines, hasMusic }}
  />
)
