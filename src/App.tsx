import React, { useState } from "react";
import ChatInterface from "./components/ChatInterface";

export default function App() {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Skyon Chatbot Demo</h1>
          <button
            onClick={() => setOpen((v) => !v)}
            className="px-3 py-2 bg-black text-white rounded-md"
          >
            {open ? "Skjul chat" : "Åpne chat"}
          </button>
        </div>
        <div className="border rounded-xl bg-white shadow p-2">
          <ChatInterface isOpen={open} onClose={() => setOpen(false)} />
        </div>
      </div>
    </div>
  );
}
