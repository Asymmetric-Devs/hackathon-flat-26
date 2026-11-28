import { continueRender, delayRender, staticFile } from 'remotion'

export const W = 1920
export const H = 1080
export const FPS = 30

// Sistema visual oficial de Muro (web/src/styles.css): pared de calle, criterio de estudio
export const C = {
  crema: '#f6f1e5',
  crema2: '#ece5d3',
  papel: '#fdfbf4',
  asfalto: '#0d1024',
  asfalto2: '#1b1f38',
  tinta: '#0d1024',
  tinta2: '#4b4a44',
  gris: '#6b6a62',
  ac: '#e8d282',       // dorado suave oficial de Muro
  ac2: '#ccb972',
  acInk: '#6e5a16',
  on: '#09090d',
  tape: 'rgba(232, 222, 190, 0.80)',
  hair: 'rgba(13, 16, 36, 0.14)',
  hairDark: 'rgba(253, 251, 244, 0.16)',
  ok: '#1f7a4c',
}

export const F = {
  display: '"Big Shoulders Display", "Arial Narrow", sans-serif',
  serif: '"Instrument Serif", Georgia, serif',
  sans: '"Geist", -apple-system, sans-serif',
  mono: '"Geist Mono", ui-monospace, monospace',
  marker: '"Permanent Marker", cursive',
}

let loaded = false
export function loadFonts() {
  if (loaded || typeof FontFace === 'undefined') return
  loaded = true
  const h = delayRender('fonts')
  const defs: [string, string, FontFaceDescriptors][] = [
    ['Big Shoulders Display', 'fonts/bigshoulders.woff2', { weight: '100 900' }],
    ['Instrument Serif', 'fonts/instrument-italic.woff2', { style: 'italic', weight: '400' }],
    ['Geist', 'fonts/geist.woff2', { weight: '100 900' }],
    ['Geist Mono', 'fonts/geistmono.woff2', { weight: '100 900' }],
    ['Permanent Marker', 'fonts/marker.woff2', { weight: '400' }],
  ]
  Promise.all(
    defs.map(async ([name, file, desc]) => {
      const ff = new FontFace(name, `url(${staticFile(file)})`, desc)
      ;(document.fonts as unknown as Set<FontFace>).add(await ff.load())
    }),
  ).finally(() => continueRender(h))
}
