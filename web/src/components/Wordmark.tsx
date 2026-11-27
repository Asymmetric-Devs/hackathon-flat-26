import { WM } from "./wordmarkData";

/**
 * El logotipo: la palabra MURO con las letras de los titulares (trazados reales de Big Shoulders
 * Display Black), la O pintada de naranja y chorreados. Se usa en la barra (chico, sin chorreado),
 * como palabra gigante de fondo del hero y del pie (con borde irregular y chorreado) y en la intro.
 * Cada letra es un <path class="l">; los chorreados son <g class="drip"> para poder animarlos.
 */
const DRIPS = [
  { x: 215, len: 380, w: 120, o: false },
  { x: 1953, len: 600, w: 132, o: false },
  { x: 3195, len: 260, w: 120, o: false },
  { x: 3690, len: 500, w: 126, o: true },
  { x: 4010, len: 200, w: 112, o: true },
];
const DRIP_ROOM = 760;

export function Wordmark({ className = "wordmark", drips = true, rough = false, clip = false, title = "Muro" }: { className?: string; drips?: boolean; rough?: boolean; clip?: boolean; title?: string }) {
  const h = WM.cap + (drips ? DRIP_ROOM : 60);
  return (
    <svg className={className} viewBox={`0 ${-WM.cap} ${WM.w} ${h}`} role={title ? "img" : "presentation"} aria-label={title || undefined} aria-hidden={title ? undefined : true}>
      <defs>
        <clipPath id="wm-clip"><rect x={-20} y={-WM.cap - 20} width={WM.w + 40} height={WM.cap + 20} /></clipPath>
      </defs>
      <g className="wm-g" filter={rough ? "url(#rough-wm)" : undefined}>
        <g clipPath={clip ? "url(#wm-clip)" : undefined}>
          {WM.letters.map((l, i) => <path key={l.ch} className={i === 3 ? "l o" : "l"} d={l.d} />)}
        </g>
        {drips && (
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
