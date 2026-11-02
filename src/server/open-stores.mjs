import { createFileStores, createMemoryStores } from "./store.mjs";

export async function openStores(env) {
  if (env.CMSA_STORE === "memory") return createMemoryStores();
  if (env.CMSA_DEV === "1" || env.CMSA_STORE === "file") {
    return createFileStores(env.CMSA_DATA_DIR || ".data");
  }
  const { createNetlifyStores } = await import("./netlify-store.mjs");
  return createNetlifyStores();
}
