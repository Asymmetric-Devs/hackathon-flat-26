import type { Metadata } from "next";
import { IBM_Plex_Mono, Schibsted_Grotesk } from "next/font/google";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Topbar } from "@/components/Topbar";
import { I18nProvider } from "@/lib/i18n/client";
import { getDict, getTheme } from "@/lib/i18n/server";
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

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDict();
  return {
    title: { default: t.meta.title, template: "%s · Oficio" },
    description: t.meta.description,
  };
}

const contractId = process.env.SELLO_CONTRACT_ID;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [{ lang, t }, theme] = await Promise.all([getDict(), getTheme()]);

  return (
    <html lang={lang} data-theme={theme ?? undefined} className={`${sans.variable} ${mono.variable}`}>
      <body>
        <I18nProvider lang={lang}>
          <Topbar />
          <main>{children}</main>
        </I18nProvider>
        <footer className="footer">
          <div className="wrap">
            <div className="footer-grid">
              <div>
                <Logo />
                <p className="footer-tag">{t.footer.tagline}</p>
              </div>
              <div>
                <h4>{t.footer.product}</h4>
                <ul>
                  <li>
                    <Link href="/piezas">{t.footer.certified}</Link>
                  </li>
                  <li>
                    <Link href="/artesanos">{t.footer.artisans}</Link>
                  </li>
                  <li>
                    <Link href="/#como-funciona">{t.footer.how}</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4>{t.footer.associations}</h4>
                <ul>
                  <li>
                    <Link href="/panel">{t.footer.panel}</Link>
                  </li>
                  <li>
                    <Link href="/#por-que">{t.footer.why}</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4>{t.footer.network}</h4>
                <ul>
                  <li>{t.footer.testnet}</li>
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
              <span>{t.footer.base}</span>
              <span>{t.footer.cases}</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
