import { useContext } from "react";
import { createContext, useEffect, useState } from "react";
import { TitleContext } from "../titleContext/TitleContext";

export const ACTIVE_CHAT_DEFAULT = {
  _id: null,
  initials: null,
  lastMessage: null,
  profilePicture: null,
  username: null,
};

export const ActiveChatContext = createContext(ACTIVE_CHAT_DEFAULT);

export default function ActiveChatContextProvider({ children }) {
  const [activeChat, setActiveChat] = useState(ACTIVE_CHAT_DEFAULT);
  const { setTitle } = useContext(TitleContext);

  // change the web title according to the user we are chatting to
  useEffect(() => {
    setTitle((prev) => ({
      ...prev,
      suffix: activeChat.username ? ` - ${activeChat.username}` : "",
    }));
  }, [activeChat]);

  return (
    <ActiveChatContext.Provider value={{ activeChat, setActiveChat }}>
      {children}
    </ActiveChatContext.Provider>
  );
}
