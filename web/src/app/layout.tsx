import type { Metadata } from "next";
import { IBM_Plex_Mono, Schibsted_Grotesk } from "next/font/google";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Topbar } from "@/components/Topbar";
import "./globals.css";

const sans = Schibsted_Grotesk({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Oficio · Origen verificado para artesanías",
    template: "%s · Oficio",
  },
  description:
    "Certificados de origen para artesanías hechas a mano, firmados en Stellar por la asociación que avala a los artesanos. Quien compra escanea el QR y comprueba quién hizo la pieza y de quién aprendió el oficio.",
};

const contractId = process.env.SELLO_CONTRACT_ID;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <Topbar />
        <main>{children}</main>
        <footer className="footer">
          <div className="wrap">
            <div className="footer-grid">
              <div>
                <Logo />
                <p className="footer-tag">
                  Origen verificado para artesanías hechas a mano. Un certificado por pieza, firmado por quien avala a
                  los artesanos.
                </p>
              </div>
              <div>
                <h4>Producto</h4>
                <ul>
                  <li>
                    <Link href="/piezas">Piezas certificadas</Link>
                  </li>
                  <li>
                    <Link href="/artesanos">Artesanos</Link>
                  </li>
                  <li>
                    <Link href="/#como-funciona">Cómo funciona</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4>Asociaciones</h4>
                <ul>
                  <li>
                    <Link href="/panel">Panel de certificación</Link>
                  </li>
                  <li>
                    <Link href="/#por-que">Por qué Stellar</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4>Red</h4>
                <ul>
                  <li>Stellar testnet</li>
                  {contractId ? (
                    <li>
                      <a href={`https://stellar.expert/explorer/testnet/contract/${contractId}`} className="mono">
                        {contractId.slice(0, 6)}…{contractId.slice(-4)} ↗
                      </a>
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
            <div className="footer-base">
              <span>Hackathon FLAT 2026 · BAF × Stellar</span>
              <span>Primer caso: Plaza de las Artes, Mendoza · Piloto en Corrientes</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
