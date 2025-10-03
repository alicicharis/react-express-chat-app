import { Route, Routes } from "react-router";
import Auth from "./components/auth";
import Chat from "./components/chat";
import Chats from "./components/chats";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/chat/:roomId" element={<Chat />} />
      <Route path="/chats" element={<Chats />} />
    </Routes>
  );
}

export default App;
