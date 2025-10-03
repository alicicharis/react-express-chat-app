import cors from "cors";
import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { db } from "./db";
import { messages } from "./db/schema";
import { getChatMessages, getUserRooms } from "./db/data";

const app = express();

const server = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.get("/rooms", async (req: Request, res: Response) => {
  const userId = req?.headers?.authorization?.split(" ")[1];

  if (!userId) {
    res.status(403).json({ error: "Unauthorized" });
    return;
  }

  const rooms = await getUserRooms(userId);

  res.status(200).json({ data: rooms });
});

app.get("/messages/:roomId", async (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  const messages = await getChatMessages(roomId);

  res.status(200).json({ data: messages });
});

app.post("/messages", async (req: Request, res: Response) => {
  const userId = req?.headers?.authorization?.split(" ")[1];

  const messageCreatePayload = {
    id: Math.random().toString(36).substring(2, 15),
    content: req.body.content,
    userId: userId,
    roomId: req.body.roomId,
  };

  const messageCreateRes = await db
    .insert(messages)
    .values(messageCreatePayload)
    .returning();

  // emit event to send message data to connected clients
  io.to(req.body.roomId).emit("chat-message", messageCreateRes[0]);

  try {
    res.status(201).json({ data: messageCreateRes[0] });
  } catch (err) {
    console.log("Error creating message: ", err);
    res.status(500).send("Error creating message");
  }
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join-room", (roomId) => {
    console.log("Joining room: ", roomId);
    socket.join(roomId);
  });
  // socket.on("chat-message", (data) => {
  //   console.log("chat-message", data);
  //   socket.emit("chat-message", { message: "Hello from server!" });
  // });
});

server.listen(3000, () => {
  console.log(`WebSocket server running on port 3000`);
  console.log(`WebSocket endpoint: ws://localhost:3000`);
});
