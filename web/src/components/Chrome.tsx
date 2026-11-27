import { useEffect, useRef, useState } from "react";
import { INSTANCE_KEY, IS_DEMO_CLOCK } from "../config";
import { short } from "../format";
import { scrollToId } from "../fx";
import { href, Route } from "../router";
import { Mark } from "./Logo";
import { useStore } from "../store";

export function Nav({ route }: { route: Route }) {
  const { signer, connecting, connect, disconnect } = useStore();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
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
    <header className="top">
     <div className="bar">
      <a className="brand" href={href.inicio} aria-label="Muro, inicio"><Mark /><span className="wm">Muro</span></a>
      <nav className="nav" aria-label="Principal">
        <a href={href.galeria} aria-current={cur("galeria")}>Galería</a>
        <a href={href.publicar} aria-current={cur("publicar")}>Publicar una obra</a>
        <a href={`${href.inicio}#como`} onClick={(e) => { if (route.page === "inicio") { e.preventDefault(); scrollToId("como"); } }}>Cómo funciona</a>
        <a href={href.evidencia} aria-current={cur("evidencia")}>Evidencia</a>
      </nav>
      <span className="net" title={IS_DEMO_CLOCK ? "En esta demo, 1 día dura 1 minuto" : "Red de pruebas"}><span>{IS_DEMO_CLOCK ? "Testnet · 1 día = 1 min" : "Testnet"}</span></span>
      <div className="wallet" ref={box}>
        <button className="btn sm mag" onClick={() => (signer ? setOpen(!open) : setOpen(true))} aria-expanded={open} aria-haspopup="menu" disabled={connecting}>
          {connecting ? "Conectando…" : signer ? short(signer.address) : "Conectar"}
        </button>
        {open && (
          <div className="menu" role="menu">
            {signer ? (
              <>
                <div style={{ padding: "8px 12px" }}><b>{signer.kind === "guest" ? "Cuenta de invitado" : "Freighter"}</b><small className="mono" style={{ wordBreak: "break-all" }}>{signer.address}</small></div>
                <hr />
                <button role="menuitem" onClick={() => { disconnect(); setOpen(false); }}>Desconectar{signer.kind === "guest" ? <small>Se descarta la cuenta de invitado de este navegador.</small> : null}</button>
              </>
            ) : (
              <>
                <button role="menuitem" onClick={() => { setOpen(false); connect("guest"); }}>Probar como invitado<small>Crea una cuenta de Testnet en este navegador y la fondea sola. Sin instalar nada.</small></button>
                <button role="menuitem" onClick={() => { setOpen(false); connect("freighter"); }}>Conectar Freighter<small>Tu billetera, en red Testnet.</small></button>
                <hr /><small style={{ padding: "0 12px 4px", color: "var(--tinta-2)" }}>Red: Testnet ({INSTANCE_KEY}). Ningún dinero real participa.</small>
              </>
            )}
          </div>
        )}
      </div>
     </div>
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
