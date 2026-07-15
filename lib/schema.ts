import { sqliteTable, integer } from "drizzle-orm/sqlite-core";

/** Visitor‑counter table – a single row (id = 1) holds the global count. */
export const visits = sqliteTable("visits", {
  id: integer("id").primaryKey(),
  count: integer("count").notNull(),
});
