import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

/** Visitor-counter table – a single row (id = 1) holds the global count. */
export const visits = sqliteTable("visits", {
  id: integer("id").primaryKey(),
  count: integer("count").notNull(),
});

/** Typing test leaderboard – stores each user's personal best score. */
export const leaderboard = sqliteTable("leaderboard", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  imageUrl: text("image_url"),
  wpm: integer("wpm").notNull(),
  rawWpm: integer("raw_wpm").notNull(),
  accuracy: integer("accuracy").notNull(),
  consistency: integer("consistency").notNull(),
  mode: text("mode").notNull(),
  chars: text("chars").notNull(),
  createdAt: text("created_at").notNull(),
});

/** Journal echoes – signed terminal reactions & one-line comments per post. */
export const journalEchoes = sqliteTable("journal_echoes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postSlug: text("post_slug").notNull(),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  provider: text("provider").notNull(),
  imageUrl: text("image_url"),
  content: text("content").notNull(),
  reaction: text("reaction"),
  createdAt: text("created_at").notNull(),
});
