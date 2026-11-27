import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El SDK de Stellar usa APIs de Node: se carga en el servidor sin empaquetar.
  serverExternalPackages: ["@stellar/stellar-sdk"],
};

export default nextConfig;
