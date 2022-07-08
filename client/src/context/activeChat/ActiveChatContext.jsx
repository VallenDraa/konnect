import { createContext, useState } from 'react';

const ACTIVE_CHAT_DEFAULT = {
  _id: null,
  initials: null,
  lastMessage: null,
  profilePicture: null,
  username: null,
};

export const ActiveChatContext = createContext(ACTIVE_CHAT_DEFAULT);

export default function ActiveChatContextProvider({ children }) {
  const [activeChat, setActiveChat] = useState(ACTIVE_CHAT_DEFAULT);
  return (
    <ActiveChatContext.Provider value={{ activeChat, setActiveChat }}>
      {children}
    </ActiveChatContext.Provider>
  );
}
