import { useContext } from "react";
import { createContext, useEffect, useState } from "react";
import { TitleContext } from "../titleContext/TitleContext";

export const ACTIVE_PRIVATE_CHAT_DEFAULT = {
  _id: null,
  username: null,
  initials: null,
  profilePicture: null,
  status: null,
  lastMessage: null,
  isOnline: false,
  lastSeen: null,
};

export const ActiveChatContext = createContext(ACTIVE_PRIVATE_CHAT_DEFAULT);

export default function ActiveChatContextProvider({ children }) {
  const [activeChat, setActiveChat] = useState(ACTIVE_PRIVATE_CHAT_DEFAULT);
  const { setTitle } = useContext(TitleContext);

  // change the web title according to the user we are chatting to
  useEffect(() => {
    setTitle((prev) => ({
      ...prev,
      suffix: activeChat.username ? ` - ${activeChat.username}` : "",
    }));
  }, [activeChat]);

  // useEffect(() => {
  //   console.log(activeChat);
  // }, [activeChat]);

  return (
    <ActiveChatContext.Provider value={{ activeChat, setActiveChat }}>
      {children}
    </ActiveChatContext.Provider>
  );
}
