import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader } from "next/font/google";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import "./globals.css";

const serif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
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
    default: "Hilo · Sello de origen",
    template: "%s · Hilo",
  },
  description:
    "Certificados de origen para artesanías de la Plaza de las Artes de Mendoza: quién hizo cada pieza, cómo, y de quién aprendió el oficio. Firmados en Stellar.",
};

const contractId = process.env.SELLO_CONTRACT_ID;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${serif.variable} ${mono.variable}`}>
      <body>
        <header className="masthead">
          <div className="wrap masthead-inner">
            <Link href="/" className="wordmark">
              <span className="wordmark-name">Hilo</span>
              <span className="wordmark-tag label">Sello de origen · Mendoza</span>
            </Link>
            <Nav />
          </div>
        </header>

        <main>{children}</main>

        <footer className="footer">
          <div className="wrap footer-grid">
            <div>
              <p className="wordmark-name">Hilo</p>
              <p className="muted">
                Un certificado por pieza, firmado por la asociación de artesanos. Nadie puede falsificarlo ni
                editarlo después.
              </p>
            </div>
            <div>
              <p className="label">Red</p>
              <p>Stellar testnet</p>
              {contractId ? (
                <p className="mono">
                  <a href={`https://stellar.expert/explorer/testnet/contract/${contractId}`}>
                    Contrato {contractId.slice(0, 6)}…{contractId.slice(-6)}
                  </a>
                </p>
              ) : null}
            </div>
            <div>
              <p className="label">Proyecto</p>
              <p>Hackathon FLAT 2026</p>
              <p className="muted">Eje territorio, memoria y arte</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
