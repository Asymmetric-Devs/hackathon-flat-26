import { Entry } from "../chain";
import { resolve, Resolved } from "../catalog";
import { live, Live } from "../live";
import { money, pct as pctf } from "../format";
import { href } from "../router";
import { useStore } from "../store";

export const STATUS_LABEL: { [k: string]: string } = { Available: "Disponible", Hung: "Colgada", Returning: "Por devolver", Sold: "Vendida", Lost: "No devuelta" };
export const STATUS_CLASS: { [k: string]: string } = { Available: "", Hung: "live", Returning: "ret", Sold: "sold", Lost: "lost" };

export function useView(e: Entry): { r: Resolved; l: Live } {
  const { now } = useStore();
  return { r: resolve(e.work.meta), l: live(e, now) };
}

export type Variant = "paste" | "frame";
/** Afiche pegado con cinta (calle) o enmarcado (galería). */
export function Painting({ r, variant = "paste", eager = false, work, hero = false, children }: { r: Resolved; variant?: Variant; eager?: boolean; work?: number; hero?: boolean; children?: React.ReactNode }) {
  const mark = { "data-work": work, "data-hero": hero ? "" : undefined };
  const img = r.img ? (
    <img src={r.img} alt={`${r.title}, ${r.artist}${r.year ? ", " + r.year : ""}`} loading={eager ? "eager" : "lazy"} decoding="async" width={1000} height={Math.round(1000 * r.ratio)} />
  ) : <span className="ph" style={{ aspectRatio: `1 / ${r.ratio}` }}><i>Tu obra va acá</i></span>;
  if (variant === "frame") return <span className="frame" {...mark}><span className="mat">{img}</span>{children}</span>;
  return (
    <span className="paste" {...mark}>
      <i className="tape a" aria-hidden="true" /><i className="tape b" aria-hidden="true" />
      <span className="sheet">{img}</span>
      {children}
    </span>
  );
}

/** Sticker redondo sobre la esquina del cuadro: lo cobrado, o el alquiler si está libre. */
export function Dot({ e, l }: { e: Entry; l: Live }) {
  if (e.work.status === "Sold") return <span className="dot" aria-hidden="true"><b>✓</b><small>vendida</small></span>;
  if (l.hung) return <span className="dot" aria-hidden="true"><b>{Math.floor(l.pct)}%</b><small>cobrado</small></span>;
  return <span className="dot" aria-hidden="true"><b>{xlmShort(e.work.rate)}</b><small>XLM/día</small></span>;
}
const xlmShort = (v: bigint) => { const n = Number(v) / 1e7; return n >= 10 ? Math.round(n).toString() : n.toLocaleString("es-AR", { maximumFractionDigits: 1 }); };

/** Cartela: título, autor y la cuenta viva de lo cobrado. */
export function Cartela({ e, r, l, compact = false }: { e: Entry; r: Resolved; l: Live; compact?: boolean }) {
  return (
    <div className="cartela">
      <b>{r.title}</b>
      <i>{r.artist}{r.year ? `, ${r.year}` : ""}</i>
      {!compact && r.medium ? <i>{r.medium}</i> : null}
      {e.work.status === "Sold" ? (
        <div className="row"><span>Vendida</span><span>{money(e.work.price, 0)}</span></div>
      ) : l.hung ? (
        <>
          <div className="row"><span>Cobró {money(l.credited, 1)}</span><span>{Math.floor(l.pct)} %</span></div>
          <div className="bar-p"><span style={{ width: `${l.pct}%` }} /></div>
        </>
      ) : (
        <div className="row"><span>Precio {money(e.work.price, 0)}</span><span>{STATUS_LABEL[e.work.status]}</span></div>
      )}
    </div>
  );
}

export function Meter({ e, l }: { e: Entry; l: Live }) {
  return (
    <div className="meter" aria-live="polite">
      <div className="nums">
        <strong>{money(l.credited, 2)}</strong>
        <span>de {money(e.work.price, 0)} · {l.pct.toFixed(1)} %</span>
      </div>
      <div className="track" role="progressbar" aria-valuenow={Math.round(l.pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Cuánto del precio ya se pagó en alquiler">
        <div className="fill" style={{ width: `${l.pct}%` }} />
      </div>
    </div>
  );
}

export const entryHref = (e: Entry) => href.obra(e.work.id);
export { pctf };
