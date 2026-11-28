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
const B01Gancho: React.FC<SceneProps> = ({ dur }) => {
  const { f } = useScene()
  const cut = Math.round(dur * 0.56)
  const sc1 = interpolate(f, [0, cut], [1.0, 1.12], clamp)
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
        <div style={{ position: 'absolute', left: 104, top: 210, width: 1240 }}>
          <Kicker at={0} dark>
            ARTE Y TERRITORIO · MENDOZA &amp; NEA
          </Kicker>
          <Rise
            text="UNA OBRA COLGADA UN MES EN UN BAR."
            at={3}
            stagger={2}
            style={{ marginTop: 24, font: `900 132px/0.89 ${F.display}`, color: C.papel }}
          />
        </div>
      </AsphaltBg>
    )
  }

  const lf = f - cut
  const p = pop(lf, 0, 13, 0.55)
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
        <div
          style={{
            marginTop: 28,
            font: `600 22px/1 ${F.mono}`,
            letterSpacing: '0.16em',
            color: C.ac,
            opacity: ramp(lf, 8, 18),
          }}
        >
          30 DÍAS EN LA PARED · SIN CONTRATO
        </div>
      </AbsoluteFill>
    </AsphaltBg>
  )
}

/** 01b: Golpe "NADA." → 3 flashes rápidos ($0 / SIN CONTRATO / SIN HISTORIAL) → Intro real 30fps MURO. */
const B01Nada: React.FC<SceneProps> = ({ line }) => {
  const { f } = useScene()
  const introStart = Math.max(36, Math.round(line.duracion * 30) + 4)

  if (f >= introStart) {
    return (
      <AbsoluteFill style={{ background: C.crema }}>
        <OffthreadVideo src={staticFile('clips/intro.mp4')} muted startFrom={0} style={clipStyle} />
      </AbsoluteFill>
    )
  }

  // 4 golpes rápidos sincronizados con "Nada. Ni un peso, ni un contrato, ni un registro..."
  const b1 = Math.round(introStart * 0.30)
  const b2 = Math.round(introStart * 0.54)
  const b3 = Math.round(introStart * 0.76)

  if (f < b1) return <KineticBeat big="NADA." accentBig startFrame={0} />
  if (f < b2) return <KineticBeat kicker="01" big="NI UN PESO." dark={false} startFrame={b1} />
  if (f < b3) return <KineticBeat kicker="02" big="NI UN CONTRATO." dark startFrame={b2} />
  return <KineticBeat kicker="03" big="NI UN REGISTRO." accentBig startFrame={b3} />
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
const B02TresNumeros: React.FC<SceneProps> = ({ dur }) => {
  const { f } = useScene()
  const c1 = Math.round(dur * 0.44)
  const c2 = Math.round(dur * 0.62)
  const c3 = Math.round(dur * 0.80)

  if (f < c1) {
    return (
      <AbsoluteFill style={{ background: C.asfalto }}>
        <OffthreadVideo src={staticFile('clips/pregunta.mp4')} muted style={clipStyle} />
      </AbsoluteFill>
    )
  }
  if (f < c2) return <KineticBeat kicker="NÚMERO 01" big="PRECIO DE VENTA" sub="Lo fija el artista al publicar su obra" dark={false} startFrame={c1} />
  if (f < c3) return <KineticBeat kicker="NÚMERO 02" big="ALQUILER POR DÍA" sub="Se devenga cada día que cuelga en la pared" dark accentBig startFrame={c2} />
  return <KineticBeat kicker="NÚMERO 03" big="DEPÓSITO EN GARANTÍA" sub="Custodiado en el contrato inteligente sobre Stellar" dark={false} startFrame={c3} />
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
const B03Laura: React.FC<SceneProps> = ({ dur }) => {
  const { f } = useScene()
  const c1 = Math.round(dur * 0.24)
  const c2 = Math.round(dur * 0.56)
  const c3 = Math.round(dur * 0.76)

  // Beat 1: Quién es Laura Zapata + onda de audio
  if (f < c1) {
    const p = pop(f, 0, 14, 0.6)
    return (
      <AsphaltBg>
        <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
          <Kicker at={0} dark>
            VALIDACIÓN EXTERNA · RESISTENCIA, CHACO
          </Kicker>
          <div style={{ font: `900 154px/0.88 ${F.display}`, color: C.papel, transform: `scale(${0.92 + 0.08 * p})` }}>
            LAURA ZAPATA
          </div>
          <div style={{ font: `450 28px/1.2 ${F.sans}`, color: 'rgba(253,251,244,0.75)' }}>
            Artista visual con taller propio · Entrevista documentada (2m 24s)
          </div>
          <div style={{ marginTop: 14 }}>
            <AudioWave bars={36} color={C.ac} />
          </div>
        </AbsoluteFill>
      </AsphaltBg>
    )
  }

  // Beat 2: Cita real en grande
  if (f < c2) {
    const lf = f - c1
    const p = ramp(lf, 0, 12)
    return (
      <PaperBg tone="crema">
        <AbsoluteFill style={{ padding: '120px 140px 160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ font: `600 18px/1 ${F.mono}`, letterSpacing: '0.14em', color: C.acInk, marginBottom: 28 }}>
            TESTIMONIO REAL · LAURA ZAPATA
          </div>
          <div
            style={{
              font: `400 72px/1.14 ${F.serif}`,
              fontStyle: 'italic',
              color: C.tinta,
              opacity: p,
              transform: `translateY(${(1 - p) * 20}px)`,
            }}
          >
            «La usaría así como está... Es una manera de ir pagándola cuando quizás no cuenta con todo el dinero junto y le gusta.»
          </div>
        </AbsoluteFill>
      </PaperBg>
    )
  }

  // Beat 3: El ajuste concreto en display gigante
  if (f < c3) {
    return (
      <KineticBeat
        kicker="AJUSTE INCORPORADO AL PRODUCTO"
        big="ELECCIÓN GENUINA. NUNCA UN FAVOR."
        accentBig
        dark
        startFrame={c2}
      />
    )
  }

  // Beat 4: Zoom directo sobre el cambio en la UI real (/obra/2)
  const reg = lerpRegion({ x: 180, y: 40, w: 1620 }, { x: 460, y: 130, w: 1280 }, ramp(f, c3, dur))
  return (
    <AbsoluteFill style={{ background: C.crema }}>
      <Cam region={reg} vw={W}>
        <Img src={staticFile('capturas/laura_ui.png')} style={{ width: W, height: H, objectFit: 'cover' }} />
      </Cam>
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

const B05Curriculum: React.FC<SceneProps> = ({ dur }) => {
  const { f } = useScene()
  const c1 = Math.round(dur * 0.44)
  const c2 = Math.round(dur * 0.68)

  // Beat 1: Zoom dinámico al currículum en /obra/1
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

  // Beat 2: Cierre del ciclo on-chain
  if (f < c2) {
    return (
      <KineticBeat
        kicker="DEVOLUCIÓN LIMPIA"
        big="STOP → CONFIRM_RETURN"
        sub="El depósito regresa al espacio y la exposición queda grabada para siempre"
        dark
        accentBig
        startFrame={c1}
      />
    )
  }

  // Beat 3: Golpe final currículum inmutable
  return (
    <KineticBeat
      kicker="CURUPAYTÍ · EXPUESTA Y DEVUELTA"
      big="UN CURRÍCULUM QUE NADIE PUEDE EDITAR."
      dark={false}
      startFrame={c2}
    />
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
const B06Arquitectura: React.FC<SceneProps> = ({ dur }) => {
  const { f } = useScene()
  const c1 = Math.round(dur * 0.28)
  const c2 = Math.round(dur * 0.52)
  const c3 = Math.round(dur * 0.78)

  if (f < c1) {
    return (
      <KineticBeat
        kicker="01 · POR QUÉ STELLAR"
        big="FRACCIÓN DE CENTAVO."
        sub="Liquidaciones diarias viables · SAC / SEP-41 · Freighter · solo estados livianos on-chain"
        dark
        accentBig
        startFrame={0}
      />
    )
  }
  if (f < c2) {
    return (
      <KineticBeat
        kicker="02 · VALIDADO CON STELLAR RAVEN"
        big="SIN PRECEDENTES EQUIVALENTES."
        sub="Alquiler diario acreditable a compra + depósito en garantía + currículum físico inmutable"
        dark={false}
        startFrame={c1}
      />
    )
  }
  if (f < c3) {
    return (
      <KineticBeat
        kicker="03 · CRITERIO TÉCNICO"
        big="¿POR QUÉ NO TRUSTLESS WORK?"
        sub="Su esquema por hitos y 0,3 % por transacción rompe el alquiler diario continuo · Sin NFTs innecesarios"
        dark
        startFrame={c2}
      />
    )
  }
  return (
    <KineticBeat
      kicker="04 · SEGURIDAD EN SOROBAN SDK 29"
      big="41 TESTS Y AUDITORÍA."
      sub="Storage instance + persistent con TTL · require_auth por rol · 9 eventos auditables"
      dark={false}
      startFrame={c3}
    />
  )
}

// ================================================================== BLOQUE 07 · MODELO DE NEGOCIO Y CIERRE (3 CORTES)
const B07Cierre: React.FC<SceneProps> = ({ dur }) => {
  const { f } = useScene()
  const c1 = Math.round(dur * 0.25)
  const c2 = Math.round(dur * 0.52)

  if (f < c1) {
    return (
      <KineticBeat
        kicker="HOY · MVP EN TESTNET"
        big="0 % DE COMISIÓN."
        sub="El contrato inteligente no retiene porcentaje alguno"
        dark={false}
        startFrame={0}
      />
    )
  }
  if (f < c2) {
    return (
      <KineticBeat
        kicker="MODELO DE NEGOCIO · PRODUCCIÓN"
        big="1 – 2 % SOLO SI SE VENDE."
        sub="Alineado al éxito del artista + servicios físicos para bares, bodegas y hoteles"
        dark
        accentBig
        startFrame={c1}
      />
    )
  }

  return (
    <AbsoluteFill style={{ background: C.asfalto }}>
      <Img
        src={staticFile('capturas/footer.png')}
        style={{
          width: W,
          height: H,
          objectFit: 'cover',
          transform: `scale(${interpolate(f, [c2, dur], [1.05, 1.0], clamp)})`,
        }}
      />
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
