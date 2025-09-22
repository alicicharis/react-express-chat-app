// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Auth from "./components/auth.tsx";
import { CookiesProvider } from "react-cookie";
import Chats from "./components/chats.tsx";

createRoot(document.getElementById("root")!).render(
  <CookiesProvider>
    <BrowserRouter>
      {/* <StrictMode> */}
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/chat/:chatId" element={<App />} />
        <Route path="/chats" element={<Chats />} />
      </Routes>
      {/* </StrictMode> */}
    </BrowserRouter>
  </CookiesProvider>
);
