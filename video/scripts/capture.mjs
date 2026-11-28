// Captura la app real de Muro (https://muro.asymmetric.com.ar/ o local) en secuencias y stills
// para el video en Remotion.
// Uso: node scripts/capture.mjs [url] [only=intro,pregunta,...]
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { chromium } from 'playwright'

const APP = (process.argv[2] && !process.argv[2].startsWith('only=') ? process.argv[2] : 'https://muro.asymmetric.com.ar/').replace(/\/$/, '')
const ONLY = (process.argv.find((a) => a.startsWith('only=')) ?? '').replace('only=', '').split(',').filter(Boolean)
const OUT = new URL('../public/capturas/', import.meta.url).pathname
const want = (n) => !ONLY.length || ONLY.includes(n)
const pad = (i) => String(i).padStart(3, '0')

const CHROME = process.env.CHROME_BIN || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`,
].find((p) => existsSync(p))

const browser = await chromium.launch({
  executablePath: CHROME || undefined,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu-sandbox'],
})

const meta = {}

async function newPage(w = 1920, h = 1080, dsf = 1) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: dsf,
    reducedMotion: 'no-preference',
    locale: 'es-AR',
  })
  const page = await ctx.newPage()
  return { ctx, page }
}

async function seq(page, name, n, step, wait = 120) {
  const dir = OUT + name
  mkdirSync(dir, { recursive: true })
  for (let i = 0; i < n; i++) {
    await step(i)
    if (wait > 0) await page.waitForTimeout(wait)
    await page.screenshot({ path: `${dir}/${pad(i)}.jpg`, type: 'jpeg', quality: 90 })
  }
  meta[name] = n
  console.log(`  [seq] ${name}: ${n} frames`)
}

// 1. Intro pincelada MURO + entrada elástica del Hero (sin acelerar)
if (want('intro')) {
  const { ctx, page } = await newPage(1920, 1080, 1)
  await page.goto(APP + '/', { waitUntil: 'domcontentloaded' })
  // Capturamos ~42 cuadros durante la coreografía de Intro.tsx (3.4s) + entrada del Hero (2.2s)
  await seq(page, 'intro', 42, async (i) => {
    if (i === 32) await page.mouse.move(1180, 520)
    if (i === 36) await page.mouse.move(1460, 440)
    if (i === 40) await page.mouse.move(980, 620)
  }, 115)
  await ctx.close()
}

// 2. Landing: #pregunta, #como, #cuotas (simulador), #pared (scroll horizontal) y footer
if (want('landing') || want('pregunta') || want('como') || want('cuotas') || want('pared') || want('footer')) {
  const { ctx, page } = await newPage(1920, 1080, 1)
  await page.goto(APP + '/', { waitUntil: 'networkidle' })
  // Saltar la intro con Escape para ir directo a las secciones
  await page.waitForTimeout(600)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(1200)

  if (want('landing') || want('pregunta')) {
    const top = await page.evaluate(() => {
      const el = document.querySelector('#pregunta')
      return el ? el.getBoundingClientRect().top + window.scrollY : 1200
    })
    await seq(page, 'pregunta', 16, async (i) => {
      const t = i / 15
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top - 240 + t * 420)
    }, 100)
  }

  if (want('landing') || want('como')) {
    const bounds = await page.evaluate(() => {
      const el = document.querySelector('#como')
      if (!el) return { top: 2200, h: 1800 }
      const r = el.getBoundingClientRect()
      return { top: r.top + window.scrollY, h: r.height }
    })
    await seq(page, 'como', 24, async (i) => {
      const t = i / 23
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), bounds.top + t * Math.max(800, bounds.h - 900))
    }, 110)
  }

  if (want('landing') || want('cuotas')) {
    await page.evaluate(() => document.querySelector('#cuotas')?.scrollIntoView({ behavior: 'instant', block: 'center' }))
    await page.waitForTimeout(500)
    // Mover el slider "Días colgada" de 40 hacia 100
    await seq(page, 'cuotas', 20, async (i) => {
      const val = Math.round(40 + (i / 19) * 60)
      await page.evaluate((v) => {
        const inputs = [...document.querySelectorAll('#cuotas input[type="range"]')]
        const slider = inputs[inputs.length - 1] || inputs[0]
        if (!slider) return
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
        setter?.call(slider, String(v))
        slider.dispatchEvent(new Event('input', { bubbles: true }))
        slider.dispatchEvent(new Event('change', { bubbles: true }))
      }, val)
    }, 90)
  }

  if (want('landing') || want('pared')) {
    const bounds = await page.evaluate(() => {
      const el = document.querySelector('#pared')
      if (!el) return { top: 4500, maxScroll: 1200 }
      const r = el.getBoundingClientRect()
      const top = r.top + window.scrollY
      // Mantener el scroll estrictamente dentro de la zona pinned de #pared
      const maxScroll = Math.max(400, r.height - window.innerHeight - 80)
      return { top, maxScroll }
    })
    await seq(page, 'pared', 24, async (i) => {
      const t = i / 23
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), bounds.top + 40 + t * bounds.maxScroll)
    }, 90)
  }

  if (want('landing') || want('footer')) {
    await page.evaluate(() => {
      const ft = document.querySelector('footer.foot, footer')
      if (ft) ft.scrollIntoView({ behavior: 'instant', block: 'start' })
      else window.scrollTo({ top: document.body.scrollHeight - window.innerHeight, behavior: 'instant' })
    })
    await page.waitForTimeout(900)
    await page.screenshot({ path: `${OUT}footer.png` })
    console.log('  [still] footer.png')
  }

  await ctx.close()
}

// 3. Publicar una obra (/#/publicar)
if (want('publicar')) {
  const { ctx, page } = await newPage(1920, 1080, 1.5)
  await page.goto(APP + '/#/publicar', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${OUT}publicar.png` })
  console.log('  [still] publicar.png')
  await ctx.close()
}

// 4. Ficha obra #2 (caja de acción "Colgar esta obra en tu espacio" — validación Laura Zapata)
if (want('laura_ui')) {
  const { ctx, page } = await newPage(1920, 1080, 1.5)
  await page.goto(APP + '/#/obra/2', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1800)
  await page.screenshot({ path: `${OUT}laura_ui.png` })
  console.log('  [still] laura_ui.png')
  await ctx.close()
}

// 5. Ficha obra #0 (Manet) — lupa 2.6× recorriendo la pintura + contador vivo + cartela de pared
if (want('obra0')) {
  const { ctx, page } = await newPage(1920, 1080, 1)
  await page.goto(APP + '/#/obra/0', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2200)
  // Encontrar el cuadro para mover la lupa encima
  const box = await page.evaluate(() => {
    const img = document.querySelector('.stage img, main img')
    if (!img) return { x: 220, y: 220, w: 680, h: 520 }
    const r = img.getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height }
  })
  await seq(page, 'obra0', 22, async (i) => {
    const t = i / 21
    const mx = box.x + box.w * (0.22 + 0.56 * t)
    const my = box.y + box.h * (0.42 + 0.18 * Math.sin(t * Math.PI * 2))
    await page.mouse.move(mx, my)
  }, 180)
  // Scroll a "La cartela de la pared"
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h2, h3')].find((e) => /cartela/i.test(e.textContent || ''))
    if (h) h.scrollIntoView({ behavior: 'instant', block: 'center' })
    else window.scrollTo({ top: 1100, behavior: 'instant' })
  })
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}cartela_wall.png` })
  console.log('  [still] cartela_wall.png')
  await ctx.close()
}

// 6. Cartela móvil QR (/#/cartela/0 en 390×844)
if (want('cartela_mobile')) {
  const { ctx, page } = await newPage(390, 844, 2)
  await page.goto(APP + '/#/cartela/0', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  // Tocar el chip de 5 XLM si existe
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((el) => /^\s*5\s*(XLM)?\s*$/i.test(el.textContent || ''))
    b?.click()
  })
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}cartela_mobile.png` })
  console.log('  [still] cartela_mobile.png')
  await ctx.close()
}

// 7. Ficha obra #1 (Curupaytí — currículum inmutable Returned)
if (want('obra1_cv')) {
  const { ctx, page } = await newPage(1920, 1080, 1.5)
  await page.goto(APP + '/#/obra/1', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h2, h3')].find((e) => /curr[ií]culum|exposic/i.test(e.textContent || ''))
    if (h) h.scrollIntoView({ behavior: 'instant', block: 'center' })
    else window.scrollTo({ top: 900, behavior: 'instant' })
  })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${OUT}obra1_cv.png` })
  console.log('  [still] obra1_cv.png')
  await ctx.close()
}

// 8. Página de Evidencia (/#/evidencia) + Stellar Expert Testnet
if (want('evidencia')) {
  const { ctx, page } = await newPage(1920, 1080, 1.5)
  await page.goto(APP + '/#/evidencia', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1800)
  await page.screenshot({ path: `${OUT}evidencia.png` })
  console.log('  [still] evidencia.png')
  await ctx.close()
}

if (want('stellar_expert')) {
  const { ctx, page } = await newPage(1920, 1080, 1.5)
  try {
    await page.goto('https://stellar.expert/explorer/testnet/contract/CD725Z7JTP3BP3SR455WKYJS3AQHHVU7HZALNQBESQ2YGMRYCORN3T2Y', {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    })
    await page.waitForTimeout(4500)
    await page.screenshot({ path: `${OUT}stellar_expert.png` })
    console.log('  [still] stellar_expert.png')
  } catch (e) {
    console.log('  [warn] stellar_expert:', e.message)
  }
  await ctx.close()
}

mkdirSync(OUT, { recursive: true })
let prev = {}
try { prev = JSON.parse(readFileSync(OUT + 'meta.json', 'utf8')) } catch {}
writeFileSync(OUT + 'meta.json', JSON.stringify({ ...prev, ...meta }, null, 2))
await browser.close()
console.log('Capturas listas ->', OUT)
