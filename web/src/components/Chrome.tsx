import { useEffect, useRef, useState } from "react";
import { INSTANCE_KEY } from "../config";
import { short } from "../format";
import { lockScroll, scrollToId } from "../fx";
import { href, Route } from "../router";
import { Mark } from "./Mark";
import { Wordmark } from "./Wordmark";
import { useStore } from "../store";

export function Nav({ route }: { route: Route }) {
  const { signer, connecting, connect, disconnect } = useStore();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [dark, setDark] = useState(false);
  const [solid, setSolid] = useState(false);
  const [menu, setMenu] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // La barra se esconde al bajar y vuelve al subir (siempre visible arriba de todo), y cambia de color
  // según la sección que tiene detrás.
  useEffect(() => {
    let last = scrollY, raf = 0;
    const theme = () => {
      const x = Math.round(innerWidth * 0.3);
      const under = document.elementsFromPoint(x, 40).find((el) => !el.closest("header.top"));
      setDark(!!under?.closest(".sec.wall, .sec.deep, footer.foot, .page.dark"));
    };
    const on = () => {
      const y = scrollY, d = y - last;
      if (y < 90) setHidden(false);
      else if (d > 8) setHidden(true);
      else if (d < -8) setHidden(false);
      setSolid(y > 40);
      last = y;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(theme);
    };
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    on();
    const t = setTimeout(theme, 300);
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); cancelAnimationFrame(raf); clearTimeout(t); };
  }, [route]);
  useEffect(() => { setHidden(false); setMenu(false); }, [route]);
  useEffect(() => {
    if (!menu) return;
    lockScroll(true);
    const esc = (ev: KeyboardEvent) => ev.key === "Escape" && setMenu(false);
    addEventListener("keydown", esc);
    return () => { removeEventListener("keydown", esc); lockScroll(false); };
  }, [menu]);

  useEffect(() => {
    if (!open) return;
    const on = (ev: MouseEvent) => { if (!box.current?.contains(ev.target as Node)) setOpen(false); };
    const esc = (ev: KeyboardEvent) => ev.key === "Escape" && setOpen(false);
    addEventListener("mousedown", on); addEventListener("keydown", esc);
    return () => { removeEventListener("mousedown", on); removeEventListener("keydown", esc); };
  }, [open]);

  if (route.page === "cartela") return null;
  const cur = (p: string) => (route.page === p ? "page" : undefined);
  return (
    <header className={`top${hidden && !open && !menu ? " away" : ""}${dark && !menu ? " dark" : ""}${solid ? " solid" : ""}${menu ? " menu-open" : ""}`}>
      <div className="bar">
        <a className="brand" href={href.inicio} aria-label="Muro, inicio"><Mark className="logo-mark" /><Wordmark className="logo-word" drips={false} title="" /></a>
        <nav className="nav" aria-label="Principal">
          <a href={href.galeria} aria-current={cur("galeria")}>Galería</a>
          <a href={href.publicar} aria-current={cur("publicar")}>Publicar una obra</a>
          <a href={`${href.inicio}#como`} onClick={(e) => { if (route.page === "inicio") { e.preventDefault(); scrollToId("como"); } }}>Cómo funciona</a>
          <a href={href.evidencia} aria-current={cur("evidencia")}>Evidencia</a>
        </nav>
        <div className="right">
        <div className="wallet" ref={box}>
          <button className="btn sm" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu" disabled={connecting}>
            {connecting ? "Conectando…" : signer ? short(signer.address) : "Conectar"}
          </button>
          {open && (
            <div className="menu" role="menu">
              {signer ? (
                <>
                  <div style={{ padding: "8px 12px" }}><b>{signer.kind === "guest" ? "Cuenta de invitado" : "Freighter"}</b><small className="mono" style={{ wordBreak: "break-all" }}>{signer.address}</small></div>
                  <hr />
                  <a className="item" role="menuitem" href={href.cuenta} onClick={() => setOpen(false)}>Mis obras y paredes<small>Las que publicaste y las que colgaste, con sus acciones.</small></a>
                  <button role="menuitem" onClick={() => { disconnect(); setOpen(false); }}>Desconectar{signer.kind === "guest" ? <small>Se descarta la cuenta de invitado de este navegador.</small> : null}</button>
                </>
              ) : (
                <>
                  <button role="menuitem" onClick={() => { setOpen(false); connect("guest"); }}>Probar como invitado<small>Crea una cuenta de Testnet en este navegador y la fondea sola. Sin instalar nada.</small></button>
                  <button role="menuitem" onClick={() => { setOpen(false); connect("freighter"); }}>Conectar Freighter<small>Tu billetera, en red Testnet.</small></button>
                  <hr /><small style={{ padding: "0 12px 4px", color: "var(--tinta-2)" }}>Red de pruebas (Testnet, {INSTANCE_KEY}). Ningún dinero real participa.</small>
                </>
              )}
            </div>
          )}
        </div>
        <button className="burger" type="button" aria-label={menu ? "Cerrar menú" : "Abrir menú"} aria-expanded={menu} onClick={() => setMenu(!menu)}><i /><i /></button>
        </div>
      </div>
      {menu && (
        <nav className="mmenu" aria-label="Principal">
          <a href={href.galeria}>Galería</a>
          <a href={href.publicar}>Publicar una obra</a>
          <a href={href.cuenta}>Mis obras</a>
          <a href={href.evidencia}>Evidencia</a>
          <p>La obra cobra por día. Si se enamoran, es suya.</p>
        </nav>
      )}
    </header>
  );
}

export function Toasts() {
  const { toasts, dismiss } = useStore();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`} onClick={() => dismiss(t.id)}>
          <b>{t.kind === "ok" ? "Listo" : "Algo salió mal"}</b>
          <span>{t.text}</span>
          {t.tx && <a href={`https://stellar.expert/explorer/testnet/tx/${t.tx}`} target="_blank" rel="noreferrer">Ver la transacción en Stellar Expert</a>}
        </div>
      ))}
    </div>
  );
}
