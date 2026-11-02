import { getStore } from "@netlify/blobs";
import { drizzle } from "drizzle-orm/netlify-db";
import { eq, like } from "drizzle-orm";
import { records } from "../../db/schema.mjs";

function kindOf(key) {
  return String(key).split(":")[0] || "record";
}

export function createNetlifyStores() {
  const db = drizzle({ schema: { records } });
  const files = getStore({ name: "cmsa-files", consistency: "strong" });
  return {
    records: {
      async get(key) {
        const [row] = await db.select().from(records).where(eq(records.key, key)).limit(1);
        return row ? row.data : null;
      },
      async set(key, value) {
        const data = value;
        await db.insert(records).values({
          key,
          kind: kindOf(key),
          data,
          updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: records.key,
          set: { data, kind: kindOf(key), updatedAt: new Date() },
        });
      },
      async delete(key) {
        await db.delete(records).where(eq(records.key, key));
      },
      async list(prefix) {
        const rows = await db.select().from(records).where(like(records.key, `${prefix}%`));
        return rows.map((row) => ({ key: row.key, value: row.data }));
      },
    },
    blobs: {
      async put(key, bytes, meta = {}) {
        await files.set(key, Buffer.from(bytes), { metadata: meta });
      },
      async get(key) {
        const result = await files.getWithMetadata(key, { type: "arrayBuffer" });
        if (!result) return null;
        return { bytes: Buffer.from(result.data), meta: result.metadata || {} };
      },
      async delete(key) {
        await files.delete(key);
      },
      async list(prefix) {
        const { blobs } = await files.list({ prefix });
        return blobs.map((item) => item.key);
      },
    },
  };
}
