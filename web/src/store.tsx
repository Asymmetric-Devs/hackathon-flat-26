import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Entry, loadAll } from "./chain";
import { CONTRACT_ID } from "./config";
import { demoEntries } from "./live";
import { connectFreighter, errText, forgetGuest, guestSigner, Signer, WalletError } from "./wallet";

type Toast = { id: number; kind: "ok" | "error"; text: string; tx?: string };
type Ctx = {
  entries: Entry[]; source: "chain" | "demo"; loading: boolean; now: number; refresh: () => Promise<void>;
  signer: Signer | null; connecting: boolean; connect: (kind: "freighter" | "guest") => Promise<void>; disconnect: () => void;
  toasts: Toast[]; toast: (kind: Toast["kind"], text: string, tx?: string) => void; dismiss: (id: number) => void;
};
const Store = createContext<Ctx>(null!);
export const useStore = () => useContext(Store);

const deployed = CONTRACT_ID !== "" && CONTRACT_ID !== "PENDIENTE";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>(() => (deployed ? [] : demoEntries()));
  const [source, setSource] = useState<"chain" | "demo">(deployed ? "chain" : "demo");
  const [loading, setLoading] = useState(deployed);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [signer, setSigner] = useState<Signer | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const toast = useCallback((kind: Toast["kind"], text: string, tx?: string) => {
    const id = ++seq.current;
    setToasts((t) => [...t.slice(-2), { id, kind, text, tx }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 9000 : 6500);
  }, []);
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const refresh = useCallback(async () => {
    if (!deployed) return;
    try {
      const all = await loadAll();
      if (all.length === 0) { setEntries(demoEntries()); setSource("demo"); }
      else { setEntries(all); setSource("chain"); }
    } catch {
      setEntries((prev) => (prev.length ? prev : demoEntries()));
      setSource((s) => (s === "chain" && entries.length ? "chain" : "demo"));
    } finally { setLoading(false); }
  }, [entries.length]);

  useEffect(() => { refresh(); const t = setInterval(refresh, 20000); return () => clearInterval(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000); return () => clearInterval(t); }, []);

  const connect = useCallback(async (kind: "freighter" | "guest") => {
    setConnecting(true);
    try {
      setSigner(kind === "freighter" ? await connectFreighter() : await guestSigner());
    } catch (e) {
      toast("error", e instanceof WalletError || e instanceof Error ? errText(e) : "No se pudo conectar.");
    } finally { setConnecting(false); }
  }, [toast]);
  const disconnect = useCallback(() => { setSigner(null); forgetGuest(); }, []);

  // Si ya hay una cuenta de invitado en este navegador, se retoma sola al recargar.
  useEffect(() => {
    let has = false;
    try { has = !!localStorage.getItem("muro.guest"); } catch { /* sin storage */ }
    if (has) guestSigner().then(setSigner).catch(() => { /* se reconecta a mano */ });
  }, []);

  const value = useMemo(() => ({ entries, source, loading, now, refresh, signer, connecting, connect, disconnect, toasts, toast, dismiss }),
    [entries, source, loading, now, refresh, signer, connecting, connect, disconnect, toasts, toast, dismiss]);
  return <Store.Provider value={value}>{children}</Store.Provider>;
}
