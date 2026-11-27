import deployed from "./deployed.json";

export const RPC_URL: string = deployed.rpcUrl;
export const PASSPHRASE: string = deployed.networkPassphrase;
export const TOKEN_ID: string = deployed.token;
export const EXPERT = "https://stellar.expert/explorer/testnet";
export const FRIENDBOT = "https://friendbot.stellar.org";
/** XLM y USDC en Stellar usan 7 decimales. En testnet se paga con XLM; en producción el activo sería USDC. */
export const DECIMALS = 7;
export const ASSET = "XLM";
export const UNIT = 10n ** BigInt(DECIMALS);

export type InstanceKey = "demo" | "real";
export type Instance = { contractId: string; daySecs: number; graceDays: number; deployTx?: string };
const instances = deployed.instances as Record<InstanceKey, Instance>;

const saved = (() => { try { return localStorage.getItem("muro.instance"); } catch { return null; } })();
export const INSTANCE_KEY: InstanceKey = saved === "real" ? "real" : "demo";
export const INSTANCE: Instance = instances[INSTANCE_KEY] ?? instances.demo;
export const CONTRACT_ID = INSTANCE.contractId;
export const DAY_SECS = INSTANCE.daySecs;
export const IS_DEMO_CLOCK = DAY_SECS < 86400;

/** Cuenta pública usada solo como fuente de simulación para lecturas. */
export const READ_ACCOUNT = "GAD6MXY72PSLIMCSY2U5SCMVEXLWKW6DXP6U3BGFWYMVFIEMVQNMI2QL";
