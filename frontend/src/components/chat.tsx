import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useParams } from "react-router";
import { apiClient } from "../lib/api";
import { socket } from "../lib/socket";
import type { Message } from "../types";

export default function Chat() {
  const [cookies] = useCookies(["user"]);
  const { roomId } = useParams();
  const userId = cookies.user.toString();

  const queryClient = useQueryClient();

  const { data: messages } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: () => apiClient.getMessages(userId, roomId || ""),
  });

  const { mutate: createMessage } = useMutation({
    mutationFn: (messageData: { content: string; roomId: string }) =>
      apiClient.createMessage(userId, messageData),
    onSuccess: (data) => {
      queryClient.setQueryData(["messages", roomId], (oldData: Message[]) => [
        ...oldData,
        data,
      ]);
    },
  });

  const [isConnected, setIsConnected] = useState(false);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const sendMessageHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!messageInputRef.current?.value || !roomId) return;

    createMessage({
      content: messageInputRef.current.value,
      roomId: roomId,
    });
  };

  useEffect(() => {
    socket.connect();
    socket.emit("join-room", roomId);

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
    };
  }, [userId]);

  return (
    <main className="flex justify-center items-center h-screen">
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
            <Link to="/chats" className="text-blue-500 text-sm font-medium">
              Chats
            </Link>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex flex-col gap-3 overflow-y-auto flex-1 p-6 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-800/50">
          {messages && messages?.length === 0 ? (
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
                  message.userId === userId ? "justify-end" : "justify-start"
                }`}
                key={message.id}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                    message.userId === userId
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                      : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-md border border-slate-200 dark:border-slate-600"
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">
                    {message.content}
                  </p>
                  <div
                    className={`text-xs mt-1 ${
                      message.userId === userId
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
    </main>
  );
}
