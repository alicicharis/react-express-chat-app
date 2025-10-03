// import { StrictMode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CookiesProvider } from "react-cookie";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import Auth from "./components/auth.tsx";
import Chat from "./components/chat.tsx";
import Chats from "./components/chats.tsx";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <CookiesProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* <StrictMode> */}
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/chat/:roomId" element={<Chat />} />
          <Route path="/chats" element={<Chats />} />
        </Routes>
        {/* </StrictMode> */}
      </BrowserRouter>
    </QueryClientProvider>
  </CookiesProvider>
);
