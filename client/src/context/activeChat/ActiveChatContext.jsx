import { createContext, useEffect, useState } from 'react';

export const ACTIVE_CHAT_DEFAULT = {
  _id: null,
  initials: null,
  lastMessageReadAt: null,
  lastMessage: null,
  profilePicture: null,
  username: null,
};

export const ActiveChatContext = createContext(ACTIVE_CHAT_DEFAULT);

export default function ActiveChatContextProvider({ children }) {
  const [activeChat, setActiveChat] = useState(ACTIVE_CHAT_DEFAULT);

  // useEffect(() => console.log(activeChat), [activeChat]);

  return (
    <ActiveChatContext.Provider value={{ activeChat, setActiveChat }}>
      {children}
    </ActiveChatContext.Provider>
  );
}
