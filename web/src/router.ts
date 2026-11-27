import { useEffect, useState } from "react";
import { toTop } from "./fx";

export type Route =
  | { page: "inicio" } | { page: "galeria" } | { page: "obra"; id: number }
  | { page: "cartela"; id: number } | { page: "publicar" } | { page: "evidencia" };

export function parseHash(hash: string): Route {
  const [seg, p] = hash.replace(/^#\/?/, "").split("/");
  const id = Number(p);
  switch (seg) {
    case "galeria": return { page: "galeria" };
    case "obra": return Number.isInteger(id) ? { page: "obra", id } : { page: "galeria" };
    case "cartela": return Number.isInteger(id) ? { page: "cartela", id } : { page: "galeria" };
    case "publicar": return { page: "publicar" };
    case "evidencia": return { page: "evidencia" };
    default: return { page: "inicio" };
  }
}
export const href = {
  inicio: "#/", galeria: "#/galeria", publicar: "#/publicar", evidencia: "#/evidencia",
  obra: (id: number) => `#/obra/${id}`, cartela: (id: number) => `#/cartela/${id}`,
};
export function useRoute(): Route {
  const [r, setR] = useState<Route>(() => parseHash(location.hash));
  useEffect(() => {
    const on = () => { setR(parseHash(location.hash)); toTop(); };
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return r;
}
