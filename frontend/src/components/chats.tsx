import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link } from "react-router";
import { apiClient } from "../lib/api";
import { socket } from "../lib/socket";

export default function Chats() {
  const [cookies] = useCookies(["user"]);

  const queryClient = useQueryClient();
  const {
    data: rooms,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => apiClient.getRooms(cookies.user),
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.connect();

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
  }, [cookies.user]);

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

        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-800/50">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center text-slate-400 dark:text-slate-500">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium">Loading chats...</p>
                <p className="text-sm">
                  Please wait while we fetch your conversations
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center text-red-400 dark:text-red-500">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium">Failed to load chats</p>
                <p className="text-sm mb-4">{error.message}</p>
                <button
                  onClick={() =>
                    queryClient.invalidateQueries({ queryKey: ["rooms"] })
                  }
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : rooms && rooms.length === 0 ? (
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
              {rooms &&
                rooms.map((chat) => (
                  <Link
                    key={chat.id}
                    className="group block relative bg-white dark:bg-slate-700 rounded-2xl p-4 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200 cursor-pointer"
                    to={`/chat/${chat.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                          {chat.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-700"></div>
                      </div>

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

                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>

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
