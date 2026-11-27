import { useId } from "react";
import { WM } from "./wordmarkData";

/**
 * El logotipo: la palabra MURO con las letras de los titulares (trazados reales de Big Shoulders
 * Display Black), la O pintada de naranja, borde irregular de pintura y chorreados.
 * El borde irregular está dibujado una sola vez en el trazado (wordmarkData.ts), así que se ve idéntico
 * en cualquier tamaño. - `drips`: chorreados.
 * - `paint`: cada letra lleva una máscara con un trazo de pincel en zigzag (clase "brush") que se
 *   anima con stroke-dashoffset para que la letra parezca pintarse.  - `tight`: sin margen abajo.
 * Cada letra es un <path class="l">; los chorreados son <g class="drip">.
 */
const DRIPS = [
  { x: 215, len: 380, w: 120, o: false },
  { x: 1953, len: 600, w: 132, o: false },
  { x: 3195, len: 260, w: 120, o: false },
  { x: 3690, len: 500, w: 126, o: true },
  { x: 4010, len: 200, w: 112, o: true },
];
const DRIP_ROOM = 760;

/** Zigzag de pincel que cubre la caja de una letra, de arriba hacia abajo. */
function brush(x0: number, x1: number) {
  const L = x0 - 110, R = x1 + 110;
  const ys = [0, 1, 2, 3, 4].map((k) => -WM.cap + 200 + k * 320);
  let d = `M${L} ${ys[0]}`;
  ys.forEach((y, k) => {
    const x = k % 2 === 0 ? R : L;
    d += ` L${x} ${y}`;
    if (k < 4) d += ` L${x} ${ys[k + 1]}`;
  });
  return d;
}

export function Wordmark({ className = "wordmark", drips = true, clip = false, paint = false, tight = false, title = "Muro" }: { className?: string; drips?: boolean; clip?: boolean; paint?: boolean; tight?: boolean; title?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const h = tight ? WM.cap : WM.cap + (drips ? DRIP_ROOM : 60);
  return (
    <svg className={className} viewBox={`0 ${-WM.cap} ${WM.w} ${h}`} role={title ? "img" : "presentation"} aria-label={title || undefined} aria-hidden={title ? undefined : true}>
      <defs>
        <clipPath id={`${uid}c`}><rect x={-20} y={-WM.cap - 20} width={WM.w + 40} height={WM.cap + 20} /></clipPath>
        {paint && WM.letters.map((l, i) => (
          <mask key={l.ch} id={`${uid}m${i}`} maskUnits="userSpaceOnUse" x={l.x0 - 160} y={-WM.cap - 120} width={l.x1 - l.x0 + 320} height={WM.cap + 300}>
            <path className="brush" d={brush(l.x0, l.x1)} fill="none" stroke="#fff" strokeWidth={380} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1} />
          </mask>
        ))}
      </defs>
      <g className="wm-g">
        <g className="lets" clipPath={clip ? `url(#${uid}c)` : undefined}>
          {WM.letters.map((l, i) => <path key={l.ch} className={i === 3 ? "l o" : "l"} d={l.d} mask={paint ? `url(#${uid}m${i})` : undefined} />)}
        </g>
        {drips && !tight && (
          <g className="drips">
            {DRIPS.map((d, i) => (
              <g key={i} className={`drip${d.o ? " o" : ""}`}>
                <rect x={d.x - d.w / 2} y={-70} width={d.w} height={d.len + 70} rx={d.w / 2} />
                <circle cx={d.x} cy={d.len} r={d.w * 0.78} />
              </g>
            ))}
          </g>
        )}
      </g>
    </svg>
  );
}
