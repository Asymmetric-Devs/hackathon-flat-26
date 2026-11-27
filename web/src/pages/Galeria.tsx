import { useState } from "react";
import { Entry } from "../chain";
import { Dot, Painting, STATUS_CLASS, STATUS_LABEL, useView } from "../components/Art";
import { money } from "../format";
import { href } from "../router";
import { useStore } from "../store";

function Card({ e }: { e: Entry }) {
  const { r, l } = useView(e);
  return (
    <a href={href.obra(e.work.id)} data-cursor="Ver obra" aria-label={`${r.title}, ${r.artist}`}>
      <Painting r={r}><Dot e={e} l={l} /></Painting>
      <div className="cartela">
        <span className={`state-chip ${STATUS_CLASS[e.work.status]}`}>{STATUS_LABEL[e.work.status]}</span>
        <b>{r.title}</b>
        <i>{r.artist}{r.year ? `, ${r.year}` : ""}</i>
        <div style={{ marginTop: 6, fontWeight: 600 }}>
          {e.work.status === "Sold" ? <>Vendida por {money(e.work.price, 0)}</> : l.hung ? <>Cobró {money(l.credited, 1)} de {money(e.work.price, 0)} · {Math.floor(l.pct)} %</> : <>{money(e.work.rate, 1)} por día · precio {money(e.work.price, 0)}</>}
        </div>
      </div>
    </a>
  );
}

const FILTERS: { k: string; label: string; test: (e: Entry) => boolean }[] = [
  { k: "all", label: "Todas", test: () => true },
  { k: "av", label: "Disponibles", test: (e) => e.work.status === "Available" },
  { k: "hung", label: "Colgadas", test: (e) => e.work.status === "Hung" || e.work.status === "Returning" },
  { k: "sold", label: "Vendidas", test: (e) => e.work.status === "Sold" },
];

export default function Galeria() {
  const { entries, loading, source } = useStore();
  const [f, setF] = useState("all");
  const list = entries.filter(FILTERS.find((x) => x.k === f)!.test);
  return (
    <main className="page">
      <h1>La galería</h1>
      <p className="sub">Obras publicadas en el contrato. Las colgadas cobran en vivo, y las disponibles esperan una pared.</p>
      {source === "demo" && <p className="notice" style={{ marginTop: 22, maxWidth: 560 }}>Se muestran obras de ejemplo: el contrato no respondió. Las acciones requieren la red.</p>}
      <div className="filters" role="group" aria-label="Filtrar">
        {FILTERS.map((x) => <button key={x.k} className="chip" aria-pressed={f === x.k} onClick={() => setF(x.k)}>{x.label}</button>)}
      </div>
      {loading && entries.length === 0 ? <div className="skeleton" style={{ height: 360, maxWidth: 520 }} /> : (
        <div className="gal">{list.map((e) => <Card key={e.work.id} e={e} />)}</div>
      )}
      {list.length === 0 && !loading && <p className="sub">No hay obras en esta categoría todavía.</p>}
    </main>
  );
}
