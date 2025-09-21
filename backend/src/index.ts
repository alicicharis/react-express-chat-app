import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;

wss.on("connection", (ws: WebSocket) => {
  console.log("New WebSocket connection established");

  ws.send(
    JSON.stringify({
      type: "welcome",
      message: "Connected to WebSocket server!",
    })
  );

  ws.on("message", (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      console.log("Received message:", message);

      ws.send(
        JSON.stringify({
          type: "echo",
          originalMessage: message,
          timestamp: new Date().toISOString(),
        })
      );
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
