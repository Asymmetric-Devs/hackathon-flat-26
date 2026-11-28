import React from 'react'
import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile } from 'remotion'
import {
  AsphaltBg,
  AudioWave,
  Cam,
  Kicker,
  MarkText,
  PaperBg,
  PhoneFrame,
  Rise,
  clamp,
  lerpRegion,
  pop,
  ramp,
  useScene,
} from './components'
import { HandLayer, HandPath, NumTag, Scrawl, wordFrame } from './hand'
import { PaintedWordmark } from './wordmark'
import { C, F, H, W } from './theme'
import type { LineaPlan } from './timing'

export type SceneProps = { dur: number; line: LineaPlan; lead: number }

const clipStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}

/** Corte cinético de pantalla completa con impacto tipográfico (0 recuadros, pura dirección de arte Muro). */
const KineticBeat: React.FC<{
  kicker?: string
  big: string
  sub?: string
  dark?: boolean
  accentBig?: boolean
  startFrame?: number
}> = ({ kicker, big, sub, dark = true, accentBig = false, startFrame = 0 }) => {
  const { f } = useScene()
  const lf = Math.max(0, f - startFrame)
  const s = pop(lf, 0, 14, 0.55)
  const subP = ramp(lf, 6, 16)
  return (
    <AbsoluteFill
      style={{
        background: dark ? C.asfalto : C.crema,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 120px',
        textAlign: 'center',
      }}
    >
      {kicker ? (
        <div
          style={{
            font: `600 20px/1 ${F.mono}`,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: dark ? C.ac : C.acInk,
            opacity: ramp(lf, 0, 10),
            marginBottom: 24,
          }}
        >
          {kicker}
        </div>
      ) : null}
      <div
        style={{
          font: `900 148px/0.88 ${F.display}`,
          letterSpacing: '-0.008em',
          textTransform: 'uppercase',
          color: accentBig ? C.ac : dark ? C.papel : C.tinta,
          transform: `scale(${0.9 + 0.1 * s}) translateY(${(1 - s) * 28}px)`,
          opacity: interpolate(s, [0, 0.25], [0, 1], clamp),
          maxWidth: 1580,
        }}
      >
        {big}
      </div>
      {sub ? (
        <div
          style={{
            marginTop: 28,
            font: `450 30px/1.35 ${F.sans}`,
            color: dark ? 'rgba(253,251,244,0.80)' : C.tinta2,
            maxWidth: 1080,
            opacity: subP,
            transform: `translateY(${(1 - subP) * 16}px)`,
          }}
        >
          {sub}
        </div>
      ) : null}
    </AbsoluteFill>
  )
}

// ================================================================== BLOQUE 01 · APERTURA
/** 01a: 2 cortes en 6 s — Bar de noche (Manet) → golpe visual ¿Cuánto cobró? sobre Van Gogh. */
const B01Gancho: React.FC<SceneProps> = ({ dur, lead }) => {
  const { f } = useScene()
  // Apertura: el logo de Muro se pinta y chorrea, igual que en la intro de la app.
  const openEnd = Math.max(30, lead - 6)
  if (f < openEnd) {
    const out = ramp(f, openEnd - 8, openEnd)
    return (
      <AbsoluteFill style={{ background: C.crema }}>
        <AbsoluteFill style={{ background: 'radial-gradient(60% 50% at 20% 18%, rgba(255,253,244,.9), transparent 70%), radial-gradient(50% 45% at 85% 85%, rgba(232,210,130,.28), transparent 70%)' }} />
        <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 90, opacity: 1 - out }}>
          <PaintedWordmark at={3} width={1280} />
        </AbsoluteFill>
      </AbsoluteFill>
    )
  }
  const f0 = f - openEnd
  const cut = openEnd + Math.round((dur - openEnd) * 0.56)
  const sc1 = interpolate(f, [openEnd, cut], [1.0, 1.12], clamp)
  const sc2 = interpolate(f, [cut, dur], [1.08, 1.0], clamp)

  if (f < cut) {
    return (
      <AsphaltBg>
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <Img
            src={staticFile('obras/manet-bar.jpg')}
            style={{ ...clipStyle, opacity: 0.42, transform: `scale(${sc1})`, filter: 'contrast(1.08)' }}
          />
          <AbsoluteFill
            style={{ background: 'linear-gradient(95deg, rgba(13,16,36,0.92) 0%, rgba(13,16,36,0.52) 100%)' }}
          />
        </AbsoluteFill>
        <div style={{ position: 'absolute', left: 104, top: 260, width: 1240 }}>
          <Rise
            text="UNA OBRA COLGADA UN MES EN UN BAR."
            at={openEnd + 3}
            stagger={2}
            style={{ font: `900 132px/0.89 ${F.display}`, color: C.papel }}
          />
        </div>
      </AsphaltBg>
    )
  }

  const lf = f - cut
  const p = pop(lf, 0, 13, 0.55)
  void f0
  return (
    <AsphaltBg>
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <Img
          src={staticFile('obras/vangogh-terraza.jpg')}
          style={{ ...clipStyle, opacity: 0.34, transform: `scale(${sc2})` }}
        />
        <AbsoluteFill style={{ background: 'rgba(13,16,36,0.68)' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            font: `900 132px/0.9 ${F.display}`,
            color: C.papel,
            transform: `scale(${0.92 + 0.08 * p})`,
          }}
        >
          <MarkText at={cut + 2}>¿CUÁNTO COBRÓ SU ARTISTA?</MarkText>
        </div>
      </AbsoluteFill>
    </AsphaltBg>
  )
}

/** 01b: Golpe "NADA." → 3 flashes rápidos ($0 / SIN CONTRATO / SIN HISTORIAL) → Intro real 30fps MURO. */
const B01Nada: React.FC<SceneProps> = ({ line, lead }) => {
  const { f } = useScene()
  // Una sola vista: "NADA." y, debajo, lo que no hay, escrito a mano a medida que se nombra.
  const tNada = wordFrame(line, lead, 'nada', 2)
  const rows = [
    { t: wordFrame(line, lead, 'peso', 14), text: 'ni un peso' },
    { t: wordFrame(line, lead, 'contrato', 24), text: 'ni un contrato' },
    { t: wordFrame(line, lead, 'registro', 34), text: 'ni un registro de dónde estuvo' },
  ]
  const p = pop(f, tNada, 12, 0.55)
  return (
    <AsphaltBg>
      <div style={{ position: 'absolute', left: 150, top: 150 }}>
        <div
          style={{
            font: `900 360px/0.8 ${F.display}`,
            color: C.ac,
            letterSpacing: '-0.01em',
            transform: `scale(${0.9 + 0.1 * p}) rotate(${-1.2 * p}deg)`,
            transformOrigin: 'left bottom',
            opacity: interpolate(p, [0, 0.2], [0, 1], clamp),
          }}
        >
          NADA.
        </div>
      </div>
      <div style={{ position: 'absolute', left: 170, top: 540, display: 'grid', rowGap: 26 }}>
        {rows.map((r, i) => {
          const a = ramp(f, r.t, r.t + 10)
          return (
            <div key={i} style={{ position: 'relative', opacity: a, transform: `translateX(${(1 - a) * -26}px)`, font: `400 62px/1.05 ${F.marker}`, color: C.papel }}>
              {r.text}
              <svg width="100%" height="14" viewBox="0 0 600 14" preserveAspectRatio="none" style={{ position: 'absolute', left: -6, right: 0, bottom: -10, width: 'calc(100% + 12px)' }}>
                <path d="M2 8 C 120 2, 260 12, 398 6 S 560 9, 598 5" fill="none" stroke={C.ac} strokeWidth="5" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ramp(f, r.t + 6, r.t + 22)} />
              </svg>
            </div>
          )
        })}
      </div>
    </AsphaltBg>
  )
}

/** 01c: Hero vivo a 30 fps (caída de obras + hover 3D real). */
const B01Muro: React.FC<SceneProps> = ({ dur }) => {
  const { f } = useScene()
  const reg = lerpRegion({ x: 0, y: 0, w: 1920 }, { x: 40, y: 18, w: 1840 }, ramp(f, 0, dur))
  return (
    <AbsoluteFill style={{ background: C.crema }}>
      <Cam region={reg} vw={W}>
        <OffthreadVideo src={staticFile('clips/intro.mp4')} muted startFrom={105} style={clipStyle} />
      </Cam>
    </AbsoluteFill>
  )
}

// ================================================================== BLOQUE 02 · LA IDEA (DINÁMICO)
/** 02a: Video real #pregunta (30fps) → 3 golpes rápidos de los 3 números. */
const B02TresNumeros: React.FC<SceneProps> = ({ line, lead }) => {
  const { f } = useScene()
  // Cada número aparece cuando la voz lo nombra; todo vive en una sola vista y se va uniendo.
  const tObra = Math.max(0, lead - 6)
  const tPrecio = wordFrame(line, lead, 'precio', 40)
  const tAlq = wordFrame(line, lead, 'alquiler', 70)
  const tDep = wordFrame(line, lead, 'deposito', 100)
  const tJoin = tDep + 34
  const po = pop(f, tObra, 14, 0.7)
  const slide = ramp(f, tPrecio - 22, tPrecio + 4)
  return (
    <PaperBg tone="crema">
      {/* la obra, pegada en la pared con cinta: arranca al centro y le hace lugar a los números */}
      <div
        style={{
          position: 'absolute',
          left: 130 + (1 - slide) * 330,
          top: 250 - (1 - slide) * 30,
          width: 600 + (1 - slide) * 120,
          padding: 16,
          background: '#fff',
          boxShadow: '0 30px 50px -26px rgba(13,16,36,.6)',
          transform: `rotate(-2.4deg) scale(${0.9 + 0.1 * po})`,
          opacity: interpolate(po, [0, 0.25], [0, 1], clamp),
        }}
      >
        <Img src={staticFile('obras/manet-bar.jpg')} style={{ width: '100%', display: 'block' }} />
        <div style={{ position: 'absolute', top: -14, left: 40, width: 96, height: 26, background: C.tape, transform: 'rotate(-6deg)' }} />
        <div style={{ position: 'absolute', top: -14, right: 40, width: 96, height: 26, background: C.tape, transform: 'rotate(5deg)' }} />
      </div>

      {/* trazos a mano de la obra a cada número */}
      <HandLayer>
        <HandPath d="M742 380 C 860 330, 980 250, 1090 236" at={tPrecio - 4} len={20} />
        <HandPath d="M744 500 C 880 520, 1020 520, 1140 524" at={tAlq - 4} len={20} />
        <HandPath d="M738 620 C 860 700, 980 770, 1100 786" at={tDep - 4} len={20} />
        {/* al final: precio y alquiler se unen en una llave que dice "esto es lo mismo" */}
        <HandPath d="M1680 262 C 1790 300, 1800 440, 1690 520" at={tJoin} len={22} color={C.acInk} w={5.5} />
      </HandLayer>

      <NumTag label="Precio de venta" value="300" unit="XLM" note="Lo fija el artista" at={tPrecio} x={1100} y={150} rot={1.2} />
      <NumTag label="Alquiler por día" value="3" unit="XLM / día" note="Corre mientras cuelga" at={tAlq} x={1150} y={430} rot={-1.4} />
      <NumTag label="Depósito en garantía" value="40" unit="XLM" note="Vuelve si todo sale bien" at={tDep} x={1110} y={690} rot={0.9} />

      <Scrawl at={tJoin + 8} x={1700} y={338} size={40} rot={-5}>
        100 días
      </Scrawl>
      <Scrawl at={tJoin + 16} x={1700} y={392} size={40} rot={-3}>
        y es suya
      </Scrawl>
    </PaperBg>
  )
}

/** 02b: Video real #como a 30 fps con punch-in suave hacia la cartela en la segunda mitad. */
const B02Colgar: React.FC<SceneProps> = ({ dur }) => {
  const { f } = useScene()
  const reg = lerpRegion({ x: 0, y: 0, w: 1920 }, { x: 60, y: 40, w: 1760 }, ramp(f, Math.round(dur * 0.4), dur))
  return (
    <AbsoluteFill style={{ background: C.asfalto }}>
      <Cam region={reg} vw={W}>
        <OffthreadVideo src={staticFile('clips/como.mp4')} muted style={clipStyle} />
      </Cam>
    </AbsoluteFill>
  )
}

/** 02c: Video real simulador #cuotas (30fps) → golpe final "HASTA AHORA." */
const B02Cuotas: React.FC<SceneProps> = ({ dur }) => {
  const { f } = useScene()
  const cut = Math.round(dur * 0.68)
  if (f < cut) {
    return (
      <AbsoluteFill style={{ background: C.papel }}>
        <OffthreadVideo src={staticFile('clips/cuotas.mp4')} muted style={clipStyle} />
      </AbsoluteFill>
    )
  }
  const cut2 = Math.round(dur * 0.86)
  if (f < cut2) {
    return (
      <KineticBeat
        kicker="EN ARGENTINA TODO SE COMPRA EN CUOTAS"
        big="MENOS EL ARTE."
        dark
        startFrame={cut}
      />
    )
  }
  return <KineticBeat big="HASTA AHORA." dark={false} startFrame={cut2} />
}

// ================================================================== BLOQUE 03 · VALIDACIÓN LAURA ZAPATA (4 CORTES VIVOS)
const B03Laura: React.FC<SceneProps> = ({ dur, line, lead }) => {
  const { f } = useScene()
  const c1 = Math.round(dur * 0.58)
  const tName = wordFrame(line, lead, 'laura', 6)
  const tTaller = wordFrame(line, lead, 'taller', 40)

  // Primera mitad: la voz de Laura, sobre papel, escrita como una cita de catálogo.
  if (f < c1) {
    const p = ramp(f, 0, 14)
    const q = ramp(f, Math.max(8, tName + 6), tName + 28)
    return (
      <PaperBg tone="crema">
        <div style={{ position: 'absolute', left: 150, top: 150, opacity: p }}>
          <div style={{ font: `600 19px/1 ${F.mono}`, letterSpacing: '.16em', color: C.acInk }}>RESISTENCIA · CHACO</div>
          <div style={{ marginTop: 16, font: `900 150px/0.88 ${F.display}`, color: C.tinta }}>LAURA ZAPATA</div>
          <div style={{ marginTop: 14, font: `450 28px/1.2 ${F.sans}`, color: C.tinta2, opacity: ramp(f, tTaller - 4, tTaller + 10) }}>
            Artista visual, con su propio taller
          </div>
        </div>
        <div style={{ position: 'absolute', left: 150, right: 260, top: 560, opacity: q, transform: `translateY(${(1 - q) * 18}px)` }}>
          <div style={{ font: `400 64px/1.16 ${F.serif}`, fontStyle: 'italic', color: C.tinta }}>
            «La usaría así como está… Es una manera de ir pagándola cuando quizás no cuenta con todo el dinero junto y le gusta.»
          </div>
        </div>
      </PaperBg>
    )
  }

  // Segunda mitad: lo que cambió en la app por su comentario, señalado a mano sobre la pantalla real.
  const lf = f - c1
  const reg = lerpRegion({ x: 180, y: 40, w: 1620 }, { x: 420, y: 120, w: 1300 }, ramp(f, c1, dur))
  return (
    <AbsoluteFill style={{ background: C.crema }}>
      <Cam region={reg} vw={W}>
        <Img src={staticFile('capturas/laura_ui.png')} style={{ width: W, height: H, objectFit: 'cover' }} />
      </Cam>
      <div
        style={{
          position: 'absolute',
          left: 120,
          bottom: 150,
          padding: '20px 34px 22px',
          background: C.papel,
          boxShadow: '0 22px 38px -20px rgba(13,16,36,.6)',
          transform: `rotate(-2deg) translateY(${(1 - ramp(f, c1 + 10, c1 + 26)) * 30}px)`,
          opacity: ramp(f, c1 + 10, c1 + 26),
          zIndex: 12,
        }}
      >
        <div style={{ position: 'absolute', top: -12, left: 28, width: 84, height: 24, background: C.tape, transform: 'rotate(-5deg)' }} />
        <div style={{ font: `400 50px/1.05 ${F.marker}`, color: C.tinta }}>
          Elegir la obra,
          <br />
          <span style={{ background: C.ac, padding: '0 10px' }}>nunca un favor.</span>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ================================================================== BLOQUE 04 · DEMO EN VIVO (30 FPS + PUNCH-INS)
const B04Publicar: React.FC<SceneProps> = ({ dur }) => {
  const { f } = useScene()
  const cut = Math.round(dur * 0.42)
  if (f < cut) {
    // Paneo horizontal dinámico de formulario → vista previa
    const reg = lerpRegion({ x: 0, y: 40, w: 1560 }, { x: 360, y: 40, w: 1560 }, ramp(f, 0, cut))
    return (
      <AbsoluteFill style={{ background: C.crema }}>
        <Cam region={reg} vw={W}>
          <Img src={staticFile('capturas/publicar.png')} style={{ width: W, height: H, objectFit: 'cover' }} />
        </Cam>
      </AbsoluteFill>
    )
  }
  return (
    <AbsoluteFill style={{ background: C.asfalto }}>
      <OffthreadVideo src={staticFile('clips/pared.mp4')} muted style={clipStyle} />
    </AbsoluteFill>
  )
}

const B04Ficha: React.FC<SceneProps> = ({ dur }) => {
  const { f } = useScene()
  const c1 = Math.round(dur * 0.56)
  const c2 = Math.round(dur * 0.78)

  // Beat 1: Video real 30 fps de la lupa 2.6× recorriendo Manet
  if (f < c1) {
    return (
      <AbsoluteFill style={{ background: C.crema }}>
        <OffthreadVideo src={staticFile('clips/obra0.mp4')} muted style={clipStyle} />
      </AbsoluteFill>
    )
  }

  // Beat 2: Punch-in rápido al panel derecho del contador (1 día = 1 minuto)
  if (f < c2) {
    const reg = lerpRegion({ x: 960, y: 140, w: 960 }, { x: 1020, y: 220, w: 860 }, ramp(f, c1, c2))
    return (
      <AbsoluteFill style={{ background: C.crema }}>
        <Cam region={reg} vw={W}>
          <OffthreadVideo src={staticFile('clips/obra0.mp4')} muted startFrom={120} style={clipStyle} />
        </Cam>
      </AbsoluteFill>
    )
  }

  // Beat 3: Golpe cinético del claim permisivo
  return (
    <KineticBeat
      kicker="CLAIM PERMISIVO ON-CHAIN"
      big="DIRECTO AL ARTISTA. BAJA EL SALDO."
      accentBig
      dark
      startFrame={c2}
    />
  )
}

// ================================================================== BLOQUE 05 · CARTELA QR + CURRÍCULUM
const B05Cartela: React.FC<SceneProps> = ({ dur }) => {
  const { f } = useScene()
  const c1 = Math.round(dur * 0.32)
  const c2 = Math.round(dur * 0.68)

  // Beat 1: Zoom dinámico sobre la cartela de pared imprimible
  if (f < c1) {
    const reg = lerpRegion({ x: 0, y: 0, w: 1920 }, { x: 260, y: 160, w: 1400 }, ramp(f, 0, c1))
    return (
      <AbsoluteFill style={{ background: C.crema }}>
        <Cam region={reg} vw={W}>
          <Img src={staticFile('capturas/cartela_wall.png')} style={{ width: W, height: H, objectFit: 'cover' }} />
        </Cam>
      </AbsoluteFill>
    )
  }

  // Beat 2: Pantalla dividida con el teléfono entrando con spring
  if (f < c2) {
    const lf = f - c1
    const s = pop(lf, 0, 14, 0.65)
    return (
      <PaperBg tone="crema">
        <div style={{ position: 'absolute', left: 112, top: 195, width: 920 }}>
          <Kicker at={c1}>PUENTE FÍSICO-DIGITAL · SIN FRICCIÓN WEB3</Kicker>
          <Rise
            text="ESCANEÁ EN EL BAR. DEJÁ PROPINA SIN INSTALAR NADA."
            at={c1 + 3}
            style={{ marginTop: 22, font: `900 108px/0.90 ${F.display}`, color: C.tinta }}
          />
        </div>
        <div style={{ position: 'absolute', right: 170, top: 96, transform: `translateY(${(1 - s) * 80}px)` }}>
          <PhoneFrame height={830}>
            <Img src={staticFile('capturas/cartela_mobile.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </PhoneFrame>
        </div>
      </PaperBg>
    )
  }

  // Beat 3: Punch-in al teléfono (modo invitado + 5 XLM directo al artista)
  const lf = f - c2
  const p = ramp(lf, 0, 14)
  return (
    <AsphaltBg>
      <div style={{ position: 'absolute', left: 120, top: 240, width: 900 }}>
        <Kicker at={c2} dark>
          MODO INVITADO TESTNET · FRIENDBOT
        </Kicker>
        <div style={{ marginTop: 24, font: `900 124px/0.9 ${F.display}`, color: C.ac }}>
          DIRECTO AL ARTISTA.
        </div>
        <div style={{ marginTop: 24, font: `450 28px/1.4 ${F.sans}`, color: 'rgba(253,251,244,0.82)', opacity: p }}>
          Cuenta temporal creada en el navegador, sin extensiones ni intermediarios.
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 170,
          top: 60,
          transform: `scale(${interpolate(lf, [0, dur - c2], [1.06, 1.14], clamp)})`,
        }}
      >
        <PhoneFrame height={830}>
          <Img src={staticFile('capturas/cartela_mobile.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </PhoneFrame>
      </div>
    </AsphaltBg>
  )
}

const B05Curriculum: React.FC<SceneProps> = ({ dur, line, lead }) => {
  const { f } = useScene()
  const c1 = Math.round(dur * 0.5)
  const tDev = wordFrame(line, lead, 'devuelve', c1 + 8)
  const tCv = wordFrame(line, lead, 'curriculum', c1 + 40)
  const tFin = wordFrame(line, lead, 'editar', Math.round(dur * 0.85))

  if (f < c1) {
    const reg = lerpRegion({ x: 0, y: 120, w: 1800 }, { x: 40, y: 340, w: 1460 }, ramp(f, 0, c1))
    return (
      <AbsoluteFill style={{ background: C.crema }}>
        <Cam region={reg} vw={W}>
          <Img src={staticFile('capturas/obra1_cv.png')} style={{ width: W, height: H, objectFit: 'cover' }} />
        </Cam>
      </AbsoluteFill>
    )
  }
  const lf = f - c1
  const po = pop(lf, 0, 14, 0.7)
  const card = pop(f, Math.max(c1 + 6, Math.min(tDev, c1 + 30)), 13, 0.6)
  const head = ramp(f, Math.max(c1 + 12, tCv - 6), Math.max(c1 + 12, tCv - 6) + 16)
  return (
    <PaperBg tone="crema">
      <div
        style={{
          position: 'absolute',
          left: 130,
          top: 300,
          width: 520,
          padding: 15,
          background: '#fff',
          boxShadow: '0 30px 50px -26px rgba(13,16,36,.6)',
          transform: `rotate(-2.2deg) scale(${0.9 + 0.1 * po})`,
          opacity: interpolate(po, [0, 0.25], [0, 1], clamp),
        }}
      >
        <Img src={staticFile('obras/candido-curupayti.jpg')} style={{ width: '100%', display: 'block' }} />
        <div style={{ position: 'absolute', top: -13, left: 36, width: 90, height: 24, background: C.tape, transform: 'rotate(-6deg)' }} />
        <div style={{ position: 'absolute', top: -13, right: 36, width: 90, height: 24, background: C.tape, transform: 'rotate(5deg)' }} />
      </div>

      {/* titular, con aire entre renglones para que el resaltado no pise nada */}
      <div style={{ position: 'absolute', left: 760, top: 110, opacity: head, transform: `translateY(${(1 - head) * 22}px)` }}>
        <div style={{ font: `900 116px/1 ${F.display}`, color: C.tinta }}>UN CURRÍCULUM</div>
        <div style={{ marginTop: 14 }}>
          <span style={{ display: 'inline-block', font: `900 116px/1.04 ${F.display}`, color: C.on, background: C.ac, padding: '4px 22px 0' }}>QUE NADIE PUEDE EDITAR.</span>
        </div>
      </div>

      {/* la entrada del currículum, como en la ficha de la app */}
      <div
        style={{
          position: 'absolute',
          left: 760,
          top: 560,
          width: 960,
          padding: '28px 36px 30px',
          background: C.papel,
          borderRadius: 4,
          boxShadow: '0 1px 0 rgba(13,16,36,.06), 0 24px 40px -22px rgba(13,16,36,.55)',
          transform: `rotate(0.6deg) translateY(${(1 - card) * 34}px)`,
          opacity: interpolate(card, [0, 0.3], [0, 1], clamp),
        }}
      >
        <div style={{ position: 'absolute', top: -11, left: 30, width: 84, height: 22, background: C.tape, transform: 'rotate(-4deg)' }} />
        <div style={{ font: `600 19px/1 ${F.mono}`, letterSpacing: '.14em', color: C.gris }}>CURRÍCULUM DE LA OBRA</div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 22 }}>
          <span style={{ font: `900 70px/0.95 ${F.display}`, color: C.tinta }}>EXPUESTA Y DEVUELTA</span>
          <span style={{ font: `600 22px/1 ${F.mono}`, background: C.ac, color: C.on, padding: '8px 14px', borderRadius: 999 }}>1,2 XLM</span>
        </div>
        <div style={{ marginTop: 10, font: `450 26px/1.3 ${F.sans}`, color: C.tinta2 }}>Con fecha, monto y espacio. No se puede editar ni borrar.</div>
      </div>
      <HandLayer>
        <HandPath d="M690 700 C 720 690, 740 690, 756 694" at={tDev} len={10} color={C.acInk} w={5} />
      </HandLayer>
      <Scrawl at={Math.max(c1 + 20, tFin - 4)} x={1180} y={880} size={44} rot={-3}>
        queda grabado para siempre
      </Scrawl>
    </PaperBg>
  )
}

// ================================================================== BLOQUE 06 · EVIDENCIA + STELLAR + RAVEN (4 CORTES VIVOS)
const B06Evidencia: React.FC<SceneProps> = ({ dur }) => {
  const { f } = useScene()
  const cut = Math.round(dur * 0.48)
  if (f < cut) {
    const reg = lerpRegion({ x: 0, y: 0, w: 1920 }, { x: 60, y: 90, w: 1680 }, ramp(f, 0, cut))
    return (
      <AbsoluteFill style={{ background: C.asfalto }}>
        <Cam region={reg} vw={W}>
          <Img src={staticFile('capturas/evidencia.png')} style={{ width: W, height: H, objectFit: 'cover' }} />
        </Cam>
      </AbsoluteFill>
    )
  }
  const reg = lerpRegion({ x: 0, y: 0, w: 1920 }, { x: 70, y: 90, w: 1540 }, ramp(f, cut, dur))
  return (
    <AbsoluteFill style={{ background: C.asfalto }}>
      <Cam region={reg} vw={W}>
        <Img src={staticFile('capturas/stellar_expert.png')} style={{ width: W, height: H, objectFit: 'cover' }} />
      </Cam>
    </AbsoluteFill>
  )
}

/** 4 planos individuales de ~5 s cada uno (en vez de 22 s viendo la misma diapositiva!). */
const B06Arquitectura: React.FC<SceneProps> = ({ line, lead }) => {
  const { f } = useScene()
  // Una sola vista: la obra al centro y, alrededor, lo que la sostiene. Cada tarjeta entra cuando la voz la nombra.
  const tObra = Math.max(0, lead - 4)
  const t1 = wordFrame(line, lead, 'stellar', 8)
  const t2 = wordFrame(line, lead, 'raven', 150)
  const t3 = wordFrame(line, lead, 'trustless', 200)
  const t4 = wordFrame(line, lead, 'tests', 330)
  const po = pop(f, tObra, 14, 0.7)
  return (
    <PaperBg tone="crema">
      <div
        style={{
          position: 'absolute',
          left: 770,
          top: 250,
          width: 380,
          padding: 14,
          background: '#fff',
          boxShadow: '0 30px 50px -26px rgba(13,16,36,.6)',
          transform: `rotate(2deg) scale(${0.9 + 0.1 * po})`,
          opacity: interpolate(po, [0, 0.25], [0, 1], clamp),
        }}
      >
        <Img src={staticFile('obras/afklint-retablo.jpg')} style={{ width: '100%', display: 'block' }} />
        <div style={{ position: 'absolute', top: -13, left: 34, width: 84, height: 24, background: C.tape, transform: 'rotate(-6deg)' }} />
        <div style={{ position: 'absolute', top: -13, right: 34, width: 84, height: 24, background: C.tape, transform: 'rotate(5deg)' }} />
      </div>

      <HandLayer>
        <HandPath d="M770 360 C 700 300, 640 250, 600 238" at={t1 - 4} len={18} />
        <HandPath d="M1160 350 C 1230 300, 1280 255, 1320 240" at={t2 - 4} len={18} />
        <HandPath d="M780 700 C 710 760, 650 790, 610 800" at={t3 - 4} len={18} />
        <HandPath d="M1150 700 C 1220 760, 1280 800, 1320 810" at={t4 - 4} len={18} />
      </HandLayer>

      <NumTag label="Por qué Stellar" value="Fracción de centavo" note="Cobrar por día es viable" at={t1} x={90} y={120} w={540} rot={-1.2} vs={58} />
      <NumTag label="Revisado con Stellar Raven" value="Sin equivalente" note="Alquiler a cuotas, depósito y currículum" at={t2} x={1290} y={130} w={540} rot={1.1} vs={58} />
      <NumTag label="Por qué no Trustless Work" value="Por hitos · 0,3 %" note="No encaja con un alquiler diario" at={t3} x={90} y={660} w={540} rot={1} vs={58} />
      <NumTag label="Respaldo" value="41 tests" note="y una auditoría de seguridad" at={t4} x={1290} y={670} w={540} rot={-1.3} vs={64} />
      <Scrawl at={t4 + 18} x={760} y={900} size={46} rot={-2}>
        por eso se sostiene
      </Scrawl>
    </PaperBg>
  )
}

// ================================================================== BLOQUE 07 · MODELO DE NEGOCIO Y CIERRE (3 CORTES)
const B07Cierre: React.FC<SceneProps> = ({ line, lead, dur }) => {
  const { f } = useScene()
  const c2 = Math.round(dur * 0.6)
  const tHoy = wordFrame(line, lead, 'hoy', 4)
  const tProd = wordFrame(line, lead, 'produccion', 60)

  if (f < c2) {
    return (
      <PaperBg tone="crema">
        <NumTag label="Hoy · MVP en Testnet" value="0 %" note="de comisión" at={tHoy} x={170} y={290} w={620} rot={-1.4} vs={190} />
        <NumTag label="En producción" value="1–2 %" note="solo cuando una obra se vende" at={tProd} x={1020} y={330} w={700} rot={1.2} vs={190} />
        <HandLayer>
          <HandPath d="M800 470 C 860 440, 930 440, 1010 470" at={tProd - 6} len={18} color={C.acInk} w={6} />
          <HandPath d="M978 440 L1012 470 L972 490" at={tProd + 8} len={8} color={C.acInk} w={6} />
        </HandLayer>
      </PaperBg>
    )
  }

  // Cierre: el logo se pinta y chorrea, como en la intro de la app, con la frase y la dirección.
  const lf = f - c2
  const tag = ramp(lf, 64, 80)
  return (
    <AbsoluteFill style={{ background: C.crema }}>
      <AbsoluteFill style={{ background: 'radial-gradient(60% 50% at 20% 18%, rgba(255,253,244,.9), transparent 70%), radial-gradient(50% 45% at 85% 85%, rgba(232,210,130,.28), transparent 70%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'center' }}>
        <PaintedWordmark at={c2 + 4} width={1280} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 170, textAlign: 'center', opacity: tag, transform: `translateY(${(1 - tag) * 14}px)` }}>
        <div style={{ font: `500 40px/1.2 ${F.sans}`, letterSpacing: '-0.01em', color: C.tinta }}>La obra cobra por día. Si se enamoran, es suya.</div>
        <div style={{ marginTop: 18, font: `600 24px/1 ${F.mono}`, letterSpacing: '.14em', color: C.acInk }}>MURO.ASYMMETRIC.COM.AR</div>
      </div>
    </AbsoluteFill>
  )
}

export const SCENES: Record<string, React.FC<SceneProps>> = {
  b01_gancho: B01Gancho,
  b01_nada: B01Nada,
  b01_muro: B01Muro,
  b02_tres_numeros: B02TresNumeros,
  b02_colgar: B02Colgar,
  b02_cuotas: B02Cuotas,
  b03_laura: B03Laura,
  b04_publicar: B04Publicar,
  b04_ficha: B04Ficha,
  b05_cartela: B05Cartela,
  b05_curriculum: B05Curriculum,
  b06_evidencia: B06Evidencia,
  b06_arquitectura: B06Arquitectura,
  b07_cierre: B07Cierre,
}
