import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const messageStatusEnum = pgEnum("message_status", [
  "sent",
  "delivered",
  "read",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chats = pgTable("chats", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMembers = pgTable("chat_members", {
  id: text("id").primaryKey(),
  chatId: text("chat_id")
    .notNull()
    .references(() => chats.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  message: text("message").notNull(),
  chatId: text("chat_id")
    .notNull()
    .references(() => chats.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messageStatuses = pgTable("message_statuses", {
  id: text("id").primaryKey(),
  messageId: text("message_id")
    .notNull()
    .references(() => messages.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  status: messageStatusEnum().default("sent"),
});
