import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Resolved } from "../catalog";
import { lockScroll } from "../fx";
import { Painting } from "./Art";

const LOUPE = 176; // diámetro de la lupa en px
const ZOOM = 2.6;

/**
 * Escenario de la obra en la ficha: tamaño fijo (las obras muy anchas o muy altas quedan bien),
 * una lupa que sigue al mouse para ver el detalle de la pincelada y el modo "Explorar" a pantalla completa.
 */
export function ArtStage({ r }: { r: Resolved }) {
  const stage = useRef<HTMLDivElement>(null);
  const loupe = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const canLoupe = typeof matchMedia === "function" && matchMedia("(pointer: fine)").matches;

  const onMove = (e: React.PointerEvent) => {
    const L = loupe.current, img = stage.current?.querySelector("img");
    if (!L || !img || !canLoupe || !r.img) return;
    const b = img.getBoundingClientRect();
    const inside = e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom;
    if (!inside) { L.style.opacity = "0"; return; }
    const px = e.clientX - b.left, py = e.clientY - b.top;
    L.style.opacity = "1";
    L.style.transform = `translate(${e.clientX - LOUPE / 2}px, ${e.clientY - LOUPE / 2}px)`;
    L.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
    L.style.backgroundSize = `${b.width * ZOOM}px ${b.height * ZOOM}px`;
    L.style.backgroundPosition = `${-(px * ZOOM - LOUPE / 2)}px ${-(py * ZOOM - LOUPE / 2)}px`;
  };
  const hide = () => { if (loupe.current) loupe.current.style.opacity = "0"; };

  return (
    <div className="stage-wrap">
      <div className="stage" ref={stage} onPointerMove={onMove} onPointerLeave={hide}>
        <button className="stage-hit" type="button" onClick={() => setOpen(true)} aria-label={`Explorar ${r.title} en pantalla completa`} data-cursor={r.img ? "Explorar" : undefined}>
          <Painting r={r} eager hero />
        </button>
        {canLoupe && r.img && <div className="loupe" ref={loupe} aria-hidden="true" />}
      </div>
      <div className="stage-cap">
        <span>{canLoupe && r.img ? "Pasá el mouse para ver el detalle" : "Tocá la obra para explorarla"}</span>
        {r.img && <button className="btn sm line" type="button" onClick={() => setOpen(true)}>Explorar la obra</button>}
      </div>
      {open && r.img && <Explorer r={r} onClose={() => setOpen(false)} />}
    </div>
  );
}

/** Visor a pantalla completa: rueda para acercar, arrastrar para mover, doble clic para alternar, pellizco en el celular. */
function Explorer({ r, onClose }: { r: Resolved; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const st = useRef({ s: 1, x: 0, y: 0 });
  const [smooth, setSmooth] = useState(false);
  const [pct, setPct] = useState(100);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef(0);
  // onClose llega como función nueva en cada render del padre (que se redibuja cada segundo por el reloj):
  // se guarda en una ref para que el efecto del visor no se reinicie ni le robe el foco al usuario.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const apply = useCallback((anim = false) => {
    const { s, x, y } = st.current;
    setSmooth(anim);
    if (img.current) img.current.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    setPct(Math.round(s * 100));
  }, []);
  const clamp = useCallback(() => {
    const b = box.current!.getBoundingClientRect(), i = img.current!;
    const w = i.offsetWidth * st.current.s, h = i.offsetHeight * st.current.s;
    const mx = Math.max(0, (w - b.width) / 2 + 80), my = Math.max(0, (h - b.height) / 2 + 80);
    st.current.x = Math.min(mx, Math.max(-mx, st.current.x));
    st.current.y = Math.min(my, Math.max(-my, st.current.y));
    if (st.current.s <= 1.001) { st.current.x = 0; st.current.y = 0; }
  }, []);
  const zoomAt = useCallback((ns: number, cx: number, cy: number, anim = false) => {
    const b = box.current!.getBoundingClientRect();
    const px = cx - (b.left + b.width / 2), py = cy - (b.top + b.height / 2);
    const k = Math.min(8, Math.max(1, ns)) / st.current.s;
    st.current.x = px - (px - st.current.x) * k;
    st.current.y = py - (py - st.current.y) * k;
    st.current.s = Math.min(8, Math.max(1, ns));
    clamp(); apply(anim);
  }, [apply, clamp]);
  const center = () => { const b = box.current!.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; };

  useEffect(() => { (box.current?.parentElement?.querySelector(".ex-close") as HTMLElement | null)?.focus(); }, []);
  useEffect(() => {
    lockScroll(true);
    const el = box.current!;
    const onWheel = (e: WheelEvent) => { e.preventDefault(); zoomAt(st.current.s * Math.exp(-e.deltaY * 0.0018), e.clientX, e.clientY); };
    el.addEventListener("wheel", onWheel, { passive: false });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      else if (e.key === "+" || e.key === "=") { const [cx, cy] = center(); zoomAt(st.current.s * 1.4, cx, cy, true); }
      else if (e.key === "-") { const [cx, cy] = center(); zoomAt(st.current.s / 1.4, cx, cy, true); }
      else if (e.key === "0") { st.current = { s: 1, x: 0, y: 0 }; apply(true); }
    };
    addEventListener("keydown", onKey);
    return () => { el.removeEventListener("wheel", onWheel); removeEventListener("keydown", onKey); lockScroll(false); };
  }, [apply, zoomAt]);

  const down = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) { const [a, b] = [...pointers.current.values()]; pinch.current = Math.hypot(a.x - b.x, a.y - b.y); }
  };
  const move = (e: React.PointerEvent) => {
    const p = pointers.current.get(e.pointerId);
    if (!p) return;
    if (pointers.current.size === 2) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current) zoomAt(st.current.s * (d / pinch.current), (a.x + b.x) / 2, (a.y + b.y) / 2);
      pinch.current = d;
      return;
    }
    if (st.current.s > 1) { st.current.x += e.clientX - p.x; st.current.y += e.clientY - p.y; clamp(); apply(); }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };
  const up = (e: React.PointerEvent) => { pointers.current.delete(e.pointerId); pinch.current = 0; };
  const dbl = (e: React.MouseEvent) => zoomAt(st.current.s > 1.5 ? 1 : 3, e.clientX, e.clientY, true);
  const step = (f: number) => { const [cx, cy] = center(); zoomAt(st.current.s * f, cx, cy, true); };

  return createPortal(
    <div className="explorer" role="dialog" aria-modal="true" aria-label={`Explorar ${r.title}`}>
      <div className="ex-top">
        <div className="ex-cap"><b>{r.title}</b><span>{r.artist}{r.year ? `, ${r.year}` : ""}{r.medium ? ` · ${r.medium}` : ""}</span></div>
        <button className="ex-close" type="button" onClick={onClose} aria-label="Cerrar">Cerrar ✕</button>
      </div>
      <div className="ex-view" ref={box} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onDoubleClick={dbl}>
        <img ref={img} src={r.img} alt={`${r.title}, ${r.artist}`} draggable={false} className={smooth ? "smooth" : ""} />
      </div>
      <div className="ex-bar">
        <span className="ex-hint">Rueda para acercar · arrastrá para mover · doble clic para alternar</span>
        <div className="ex-ctl">
          <button type="button" onClick={() => step(1 / 1.4)} aria-label="Alejar">−</button>
          <b aria-live="polite">{pct}%</b>
          <button type="button" onClick={() => step(1.4)} aria-label="Acercar">+</button>
          <button type="button" onClick={() => { st.current = { s: 1, x: 0, y: 0 }; apply(true); }} aria-label="Restablecer">Ajustar</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
