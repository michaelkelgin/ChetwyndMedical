import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** Document store for sign-in tokens, rate limits, change records, and audit snapshots. */
export const records = pgTable(
  "cmsa_records",
  {
    key: text("key").primaryKey(),
    kind: text("kind").notNull(),
    data: jsonb("data").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("cmsa_records_kind_idx").on(table.kind)],
);
