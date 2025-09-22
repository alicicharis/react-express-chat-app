"use client";

import { useRef, useState, useEffect } from "react";

type Message = {
  id: number;
  message: string;
  userId: string;
};

export default function Chat() {
  const activeUser = "1";

  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data?.length) {
        setMessages(data);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessageHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!messageInputRef.current?.value) return;

    if (wsRef.current && isConnected) {
      const messagePayload = {
        id: Math.random() * 1000,
        userId: activeUser,
        message: messageInputRef.current?.value || "",
      };

      wsRef.current.send(JSON.stringify(messagePayload));

      setMessages([...messages, messagePayload]);

      messageInputRef.current!.value = "";
    }
  };

  return (
    <div className="w-full max-w-5xl lg:min-w-5xl mx-auto bg-gray-600 h-[90vh] p-4 rounded-lg flex flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
        <span className="text-white text-sm">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 text-white">
        {messages?.map((message) => (
          <div
            className={`rounded-lg px-4 py-2 w-fit ${
              message.userId === activeUser
                ? "bg-blue-500 justify-end self-end"
                : "bg-gray-500 justify-start"
            }`}
            key={message.id}
          >
            {message.message}
          </div>
        ))}
      </div>
      <form
        onSubmit={sendMessageHandler}
        className="flex gap-2 mt-4 items-center"
      >
        <input
          type="text"
          ref={messageInputRef}
          className="w-full rounded-lg bg-white text-black placeholder:text-gray-500 px-4 py-2"
          placeholder="Message..."
        />
        <button
          type="submit"
          className="px-10 py-2 rounded-lg bg-blue-500 text-white whitespace-nowrap"
        >
          Send
        </button>
      </form>
    </div>
  );
}
