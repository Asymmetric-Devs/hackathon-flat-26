/**
 * La palabra MURO armada con ladrillos (una fuente de 5x7 donde cada celda es un ladrillo).
 * La O es el ladrillo "pintado": naranja, con chorreado. Es el logo: se usa en la barra,
 * en la intro, en el fondo del hero y en el pie. Cada ladrillo es un <rect class="b"> para poder animarlo.
 */
const GLYPHS: Record<string, string[]> = {
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
};
const WORD = ["M", "U", "R", "O"];
const PX = 7, PY = 4.4; // paso entre ladrillos (el tamaño del ladrillo depende de `solid`)
const GX = 1;
const LW = 5 * PX, LGAP = PX;
export const BRICK_VIEW = { w: 4 * LW + 3 * LGAP - GX, h: 7 * PY - 1 + 13 };

type Cell = { x: number; y: number; o: boolean; tone: number; key: string };
const cells: Cell[] = [];
WORD.forEach((ch, li) => {
  GLYPHS[ch].forEach((row, r) => {
    [...row].forEach((v, c) => {
      if (v === "1") cells.push({ x: li * (LW + LGAP) + c * PX, y: r * PY, o: ch === "O", tone: ((r * 7 + c * 3 + li * 5) % 4) * 0.045, key: `${li}-${r}-${c}` });
    });
  });
});
// chorreado desde la fila de abajo de la O: columna, largo
const DRIPS = [{ c: 1, len: 8.5 }, { c: 2, len: 3.2 }, { c: 3, len: 12 }];
const OX = 3 * (LW + LGAP);

/** `solid`: ladrillos casi pegados (se lee mejor chico o muy grande); sin `solid`, se nota más la juntura. */
export function BrickWord({ className = "brickword", drips = true, title = "Muro", solid = false }: { className?: string; drips?: boolean; title?: string; solid?: boolean }) {
  const CW = solid ? 6.85 : 6, CH = solid ? 4.25 : 3.4, BOTTOM = 6 * PY + CH;
  return (
    <svg className={className} viewBox={`0 0 ${BRICK_VIEW.w} ${BRICK_VIEW.h}`} role="img" aria-label={title} preserveAspectRatio="xMinYMin meet">
      <g className="bricks">
        {cells.map((c) => (
          <rect key={c.key} className={c.o ? "b o" : "b"} x={c.x} y={c.y} width={CW} height={CH} rx={solid ? 0.55 : 0.7} style={{ opacity: 1 - c.tone }} />
        ))}
      </g>
      {drips && (
        <g className="drips">
          {DRIPS.map((d, i) => (
            <g key={i} className={`drip d${i}`}>
              <rect className="o" x={OX + d.c * PX + (CW - 2.4) / 2} y={BOTTOM - 0.5} width={2.4} height={d.len} />
              <circle className="o" cx={OX + d.c * PX + CW / 2} cy={BOTTOM + d.len - 0.3} r={1.7} />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
