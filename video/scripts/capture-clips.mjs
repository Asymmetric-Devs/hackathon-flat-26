// Graba clips de video REALES y fluidos (1920x1080 @ 30 fps H.264) de la app viva de Muro
// usando Playwright recordVideo + scroll/mouse suavizados con requestAnimationFrame.
// Uso: node scripts/capture-clips.mjs [url] [only=intro,pregunta,...]
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from 'playwright'

const APP = (process.argv[2] && !process.argv[2].startsWith('only=') ? process.argv[2] : 'https://muro.asymmetric.com.ar/').replace(/\/$/, '')
const ONLY = (process.argv.find((a) => a.startsWith('only=')) ?? '').replace('only=', '').split(',').filter(Boolean)
const OUT = resolve(new URL('../public/clips', import.meta.url).pathname)
const TMP = resolve(new URL('../out/raw-clips', import.meta.url).pathname)
const want = (n) => !ONLY.length || ONLY.includes(n)

mkdirSync(OUT, { recursive: true })
mkdirSync(TMP, { recursive: true })

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

/** Graba un clip con trim inicial (para cortar el frame blanco de carga) y lo exporta a MP4 30fps limpio. */
async function recordClip(name, trimStartSec, fn) {
  const clipTmp = resolve(TMP, name)
  rmSync(clipTmp, { recursive: true, force: true })
  mkdirSync(clipTmp, { recursive: true })

  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    locale: 'es-AR',
    recordVideo: { dir: clipTmp, size: { width: 1920, height: 1080 } },
  })
  const page = await ctx.newPage()
  const video = page.video()

  await fn(page)
  await ctx.close()

  const webm = await video.path()
  const mp4 = resolve(OUT, `${name}.mp4`)
  const args = ['-y']
  if (trimStartSec > 0) args.push('-ss', String(trimStartSec))
  args.push(
    '-i', webm,
    '-vf', 'fps=30,scale=1920:1080:flags=lanczos',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-an',
    mp4,
  )
  execFileSync('ffmpeg', args, { stdio: 'ignore' })
  console.log(`  [clip 30fps] ${name}.mp4`)
}

/** Scroll fluido de y0 a y1 durante durMs milisegundos usando requestAnimationFrame con easing cúbico. */
async function smoothScroll(page, y0, y1, durMs) {
  await page.evaluate(
    ({ y0, y1, durMs }) =>
      new Promise((res) => {
        window.scrollTo({ top: y0, behavior: 'instant' })
        const t0 = performance.now()
        const step = (now) => {
          const p = Math.min(1, (now - t0) / durMs)
          const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
          window.scrollTo({ top: y0 + (y1 - y0) * e, behavior: 'instant' })
          if (p < 1) requestAnimationFrame(step)
          else res()
        }
        requestAnimationFrame(step)
      }),
    { y0, y1, durMs },
  )
}

// 1. Intro pincelada real de Intro.tsx (3.4 s) + entrada elástica del Hero + inclinación 3D
if (want('intro')) {
  await recordClip('intro', 0.35, async (page) => {
    await page.goto(APP + '/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(5400)
    // Deslizar el mouse suavemente sobre las obras del hero para activar inclinación 3D
    await page.mouse.move(1120, 480, { steps: 25 })
    await page.waitForTimeout(600)
    await page.mouse.move(1480, 420, { steps: 30 })
    await page.waitForTimeout(700)
    await page.mouse.move(980, 660, { steps: 30 })
    await page.waitForTimeout(800)
  })
}

// 2. #pregunta (scroll fluido letra por letra)
if (want('pregunta')) {
  await recordClip('pregunta', 2.4, async (page) => {
    await page.goto(APP + '/', { waitUntil: 'networkidle' })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(900)
    const top = await page.evaluate(() => {
      const el = document.querySelector('#pregunta')
      return el ? el.getBoundingClientRect().top + window.scrollY : 1100
    })
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.max(0, top - 140))
    await page.waitForTimeout(700)
    await smoothScroll(page, Math.max(0, top - 140), top + 240, 5200)
    await page.waitForTimeout(1000)
  })
}

// 3. #como (los 4 pasos con Fernando Fader rotando suavemente)
if (want('como')) {
  await recordClip('como', 2.4, async (page) => {
    await page.goto(APP + '/', { waitUntil: 'networkidle' })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(900)
    const b = await page.evaluate(() => {
      const el = document.querySelector('#como')
      if (!el) return { top: 2200, h: 1800 }
      const r = el.getBoundingClientRect()
      return { top: r.top + window.scrollY, h: r.height }
    })
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), b.top)
    await page.waitForTimeout(700)
    await smoothScroll(page, b.top, b.top + Math.max(900, b.h - 980), 6800)
    await page.waitForTimeout(1000)
  })
}

// 4. #cuotas (simulador moviendo el slider de 40 a 100 fluidamente)
if (want('cuotas')) {
  await recordClip('cuotas', 2.4, async (page) => {
    await page.goto(APP + '/', { waitUntil: 'networkidle' })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(900)
    await page.evaluate(() => document.querySelector('#cuotas')?.scrollIntoView({ behavior: 'instant', block: 'center' }))
    await page.waitForTimeout(900)
    await page.evaluate(
      () =>
        new Promise((res) => {
          const inputs = [...document.querySelectorAll('#cuotas input[type="range"]')]
          const slider = inputs[inputs.length - 1] || inputs[0]
          if (!slider) return res()
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
          const t0 = performance.now()
          const dur = 5200
          let last = -1
          const step = (now) => {
            const p = Math.min(1, (now - t0) / dur)
            const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
            const v = Math.round(40 + e * 60)
            if (v !== last) {
              last = v
              setter?.call(slider, String(v))
              slider.dispatchEvent(new Event('input', { bubbles: true }))
              slider.dispatchEvent(new Event('change', { bubbles: true }))
            }
            if (p < 1) requestAnimationFrame(step)
            else res()
          }
          requestAnimationFrame(step)
        }),
    )
    await page.waitForTimeout(1600)
  })
}

// 5. #pared (scroll horizontal cinematográfico de La pared)
if (want('pared')) {
  await recordClip('pared', 2.4, async (page) => {
    await page.goto(APP + '/', { waitUntil: 'networkidle' })
    await page.keyboard.press('Escape')
    await page.waitForTimeout(900)
    const b = await page.evaluate(() => {
      const el = document.querySelector('#pared')
      if (!el) return { top: 4500, maxScroll: 1200 }
      const r = el.getBoundingClientRect()
      return { top: r.top + window.scrollY + 30, maxScroll: Math.max(500, r.height - window.innerHeight - 100) }
    })
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), b.top)
    await page.waitForTimeout(700)
    await smoothScroll(page, b.top, b.top + b.maxScroll, 6500)
    await page.waitForTimeout(900)
  })
}

// 6. /#/obra/0 (Manet — lupa 2.6× recorriendo las pinceladas como manteca)
if (want('obra0')) {
  await recordClip('obra0', 2.6, async (page) => {
    await page.goto(APP + '/#/obra/0', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    const box = await page.evaluate(() => {
      const img = document.querySelector('.stage img, main img')
      if (!img) return { x: 220, y: 220, w: 680, h: 520 }
      const r = img.getBoundingClientRect()
      return { x: r.x, y: r.y, w: r.width, h: r.height }
    })
    await page.mouse.move(box.x + box.w * 0.25, box.y + box.h * 0.48, { steps: 20 })
    await page.waitForTimeout(400)
    await page.mouse.move(box.x + box.w * 0.52, box.y + box.h * 0.34, { steps: 45 })
    await page.waitForTimeout(300)
    await page.mouse.move(box.x + box.w * 0.72, box.y + box.h * 0.56, { steps: 45 })
    await page.waitForTimeout(300)
    await page.mouse.move(box.x + box.w * 0.44, box.y + box.h * 0.62, { steps: 40 })
    await page.waitForTimeout(1200)
  })
}

await browser.close()
console.log('Clips reales 30fps listos ->', OUT)
