import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const room_members = pgTable("room_members", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  roomId: text("room_id").references(() => rooms.id),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  roomId: text("room_id").references(() => rooms.id),
  userId: text("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
