import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { Link } from "react-router";

type Chat = {
  chatId: string;
  memberId: string;
  name: string;
};

export default function Chats() {
  const [cookies] = useCookies(["user"]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const ws = new WebSocket(
      "ws://localhost:3001?route=chats&userId=" + cookies.user
    );
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "chats") {
        setChats(data.data);
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
            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Chats
            </div>
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-800/50">
          {chats.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
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
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium">No chats yet</p>
                <p className="text-sm">Your conversations will appear here</p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {chats.map((chat) => (
                <Link
                  key={chat.chatId}
                  className="group block relative bg-white dark:bg-slate-700 rounded-2xl p-4 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200 cursor-pointer"
                  to={`/chat/${chat.chatId}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                        {chat.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-700"></div>
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-slate-800 dark:text-slate-200 font-semibold text-sm truncate">
                          {chat.name}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          2m
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                        Last message preview...
                      </p>
                    </div>

                    {/* Unread indicator */}
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-slate-800 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-center">
            <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2">
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              New Chat
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
