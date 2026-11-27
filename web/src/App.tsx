import { useEffect } from "react";
import { Cursor, Progress } from "./components/Cursor";
import { Nav, Toasts } from "./components/Chrome";
import Cartela from "./pages/Cartela";
import Evidencia from "./pages/Evidencia";
import Galeria from "./pages/Galeria";
import Landing from "./pages/Landing";
import Obra from "./pages/Obra";
import Publicar from "./pages/Publicar";
import { startSmooth, stopSmooth } from "./fx";
import { useRoute } from "./router";
import { StoreProvider } from "./store";

function Pages() {
  const r = useRoute();
  useEffect(() => { startSmooth(); return stopSmooth; }, []);
  return (
    <>
      <Progress />
      <Cursor />
      <Nav route={r} />
      {r.page === "inicio" && <Landing />}
      {r.page === "galeria" && <Galeria />}
      {r.page === "obra" && <Obra id={r.id} />}
      {r.page === "cartela" && <Cartela id={r.id} />}
      {r.page === "publicar" && <Publicar />}
      {r.page === "evidencia" && <Evidencia />}
      <Toasts />
    </>
  );
}
export default function App() { return <StoreProvider><Pages /></StoreProvider>; }
