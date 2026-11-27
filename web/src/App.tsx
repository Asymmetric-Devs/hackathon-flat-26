import { useEffect } from "react";
import { Nav, Toasts } from "./components/Chrome";
import Cartela from "./pages/Cartela";
import Evidencia from "./pages/Evidencia";
import Galeria from "./pages/Galeria";
import Landing from "./pages/Landing";
import Obra from "./pages/Obra";
import Cuenta from "./pages/Cuenta";
import Publicar from "./pages/Publicar";
import { startSmooth, stopSmooth } from "./fx";
import { initRouter, useRoute } from "./router";
import { StoreProvider } from "./store";

function Pages() {
  const r = useRoute();
  useEffect(() => { initRouter(); startSmooth(); return stopSmooth; }, []);
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="rough-wm" x="-4%" y="-8%" width="108%" height="125%"><feTurbulence type="fractalNoise" baseFrequency=".012 .018" numOctaves="3" seed="7" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="58" /></filter>
        <filter id="rough-wm-sm" x="-6%" y="-14%" width="112%" height="128%"><feTurbulence type="fractalNoise" baseFrequency=".011 .02" numOctaves="2" seed="3" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="105" xChannelSelector="R" yChannelSelector="G" /></filter>
      </svg>
      <Nav route={r} />
      {r.page === "inicio" && <Landing />}
      {r.page === "galeria" && <Galeria />}
      {r.page === "obra" && <Obra id={r.id} />}
      {r.page === "cartela" && <Cartela id={r.id} />}
      {r.page === "publicar" && <Publicar />}
      {r.page === "evidencia" && <Evidencia />}
      {r.page === "cuenta" && <Cuenta />}
      <Toasts />
    </>
  );
}
export default function App() { return <StoreProvider><Pages /></StoreProvider>; }
