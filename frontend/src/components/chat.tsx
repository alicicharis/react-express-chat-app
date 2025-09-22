"use client";

import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { useParams } from "react-router";

type Message = {
  id: number;
  message: string;
  userId: string;
};

export default function Chat() {
  const [cookies] = useCookies(["user"]);
  const { chatId } = useParams();

  console.log("CHAT ID: ", chatId);

  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001?route=chat&chatId=" + chatId);
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
        userId: cookies.user,
        message: messageInputRef.current?.value || "",
      };

      wsRef.current.send(JSON.stringify(messagePayload));

      setMessages([...messages, messagePayload]);

      messageInputRef.current!.value = "";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-emerald-500" : "bg-red-500"
                } shadow-sm`}
              ></div>
              {isConnected && (
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
              )}
            </div>
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm">
            Chat Room
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex flex-col gap-3 overflow-y-auto flex-1 p-6 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-800/50">
        {messages?.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400 dark:text-slate-500">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm">Send your first message below</p>
            </div>
          </div>
        ) : (
          messages?.map((message) => (
            <div
              className={`flex ${
                message.userId === cookies.user
                  ? "justify-end"
                  : "justify-start"
              }`}
              key={message.id}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  message.userId === cookies.user
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                    : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-md border border-slate-200 dark:border-slate-600"
                }`}
              >
                <p className="text-sm leading-relaxed break-words">
                  {message.message}
                </p>
                <div
                  className={`text-xs mt-1 ${
                    message.userId === cookies.user
                      ? "text-blue-100"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-800 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={sendMessageHandler} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <input
              type="text"
              ref={messageInputRef}
              className="w-full rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 px-4 py-3 pr-12 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 resize-none"
              placeholder="Type your message..."
              disabled={!isConnected}
            />
          </div>
          <button
            type="submit"
            disabled={!isConnected}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
