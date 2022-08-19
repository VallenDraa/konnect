import { createContext, useRef } from "react";

export const ChatboxContext = createContext(null);

export default function ChatboxContextProvider({ children }) {
  const chatBoxRef = useRef(null);

  return (
    <ChatboxContext.Provider value={chatBoxRef}>
      {children}
    </ChatboxContext.Provider>
  );
}
