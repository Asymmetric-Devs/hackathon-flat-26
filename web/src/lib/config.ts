import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable ${name}. Corré scripts/deploy-testnet.sh o copiá web/.env.example a web/.env.local.`,
    );
  }
  return value;
}

export const config = {
  get rpcUrl() {
    return process.env.STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org";
  },
  get networkPassphrase() {
    return process.env.STELLAR_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015";
  },
  get contractId() {
    return required("SELLO_CONTRACT_ID");
  },
  get associationSecret() {
    return required("ASSOCIATION_SECRET");
  },
  get panelPassword() {
    return required("PANEL_PASSWORD");
  },
  get publicBaseUrl() {
    return (process.env.PUBLIC_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  },
  get dataDir() {
    return process.env.HILO_DATA_DIR ?? ".data";
  },
};

export const explorer = {
  tx: (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`,
  contract: (id: string) => `https://stellar.expert/explorer/testnet/contract/${id}`,
  account: (id: string) => `https://stellar.expert/explorer/testnet/account/${id}`,
};
