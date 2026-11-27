import { Entry } from "../chain";
import { resolve, Resolved } from "../catalog";
import { live, Live } from "../live";
import { money, pct as pctf } from "../format";
import { href } from "../router";
import { useStore } from "../store";

export const STATUS_LABEL: { [k: string]: string } = { Available: "Disponible", Hung: "Colgada", Returning: "Por devolver", Sold: "Vendida", Lost: "No devuelta" };
export const STATUS_CLASS: { [k: string]: string } = { Available: "", Hung: "hung", Returning: "ret", Sold: "sold", Lost: "lost" };

export function useView(e: Entry): { r: Resolved; l: Live } {
  const { now } = useStore();
  return { r: resolve(e.work.meta), l: live(e, now) };
}

export function Painting({ r, matted = true, eager = false }: { r: Resolved; matted?: boolean; eager?: boolean }) {
  return (
    <span className={`frame${matted ? "" : " nomat"}`}>
      <span className="mat" style={{ display: "block" }}>
        {r.img ? <img src={r.img} alt={`${r.title}, ${r.artist}${r.year ? ", " + r.year : ""}`} loading={eager ? "eager" : "lazy"} decoding="async" width={1000} height={Math.round(1000 * r.ratio)} />
          : <span style={{ display: "block", aspectRatio: `1 / ${r.ratio}`, background: "var(--pared-3)" }} />}
      </span>
    </span>
  );
}

/** Cartela de museo: título, autor, y la cuenta viva de lo cobrado. */
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
          <div className="bar"><span style={{ width: `${l.pct}%` }} /></div>
        </>
      ) : (
        <div className="row"><span>{money(e.work.rate, 1)} por día</span><span>{STATUS_LABEL[e.work.status]}</span></div>
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
