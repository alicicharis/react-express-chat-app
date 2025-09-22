import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { db } from "./db";
import { chatMembers, chats, users } from "./db/schema";
import { asc, eq } from "drizzle-orm";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;

type Message = {
  id: number;
  message: string;
  userId: string;
};

const MESSAGES: Message[] = [
  { id: 1, message: "Hello, how are you?", userId: "1" },
  { id: 2, message: "I'm fine, thank you!", userId: "2" },
  { id: 3, message: "What's your name?", userId: "1" },
  { id: 4, message: "My name is John!", userId: "2" },
  { id: 5, message: "What's your name?", userId: "1" },
  { id: 6, message: "My name is John!", userId: "2" },
  { id: 7, message: "What's your name?", userId: "1" },
  { id: 8, message: "My name is John!", userId: "2" },
];

wss.on("connection", async (ws: WebSocket, req: Request) => {
  console.log("New WebSocket connection established");

  const rawQuery = (req.url || "").split("?")[1] || "";
  const params = new URLSearchParams(rawQuery);

  const route = params.get("route");
  const userId = params.get("userId");

  console.log("USER ID: ", userId);

  if (route === "chats" && userId) {
    const chatsForUser = db
      .select({ chatId: chatMembers.chatId })
      .from(chatMembers)
      .where(eq(chatMembers.userId, userId))
      .as("convs_for_user");

    // main query
    const chatsData = await db
      .select({
        chatId: chats.id,
        memberId: users.id,
        name: users.name,
      })
      .from(chats)
      .innerJoin(chatMembers, eq(chatMembers.chatId, chats.id))
      .innerJoin(users, eq(users.id, chatMembers.userId))
      .innerJoin(chatsForUser, eq(chatsForUser.chatId, chats.id))
      .orderBy(asc(chats.id), asc(users.id));

    ws.send(
      JSON.stringify({
        data: chatsData?.filter((chat) => chat.memberId !== userId),
        type: "chats",
      })
    );
  }

  console.log("Route: ", route);

  ws.on("message", (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      console.log("Received message:", message);
      MESSAGES.push(message);

      ws.send(JSON.stringify(MESSAGES));
    } catch (error) {
      console.error("Error parsing message:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid JSON format",
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
});
