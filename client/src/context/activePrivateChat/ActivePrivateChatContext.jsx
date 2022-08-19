import { useContext } from "react";
import { createContext, useEffect, useState } from "react";
import { TitleContext } from "../titleContext/TitleContext";

export const ACTIVE_PRIVATE_CHAT_DEFAULT = {
  _id: null,
  username: null,
  initials: null,
  profilePicture: null,
  status: null,
  isOnline: false,
  lastSeen: null,
};

export const ActivePrivateChatContext = createContext(
  ACTIVE_PRIVATE_CHAT_DEFAULT
);

export default function ActivePrivateChatContextProvider({ children }) {
  const [activePrivateChat, setActivePrivateChat] = useState(
    ACTIVE_PRIVATE_CHAT_DEFAULT
  );
  const { setTitle } = useContext(TitleContext);

  // change the web title according to the user we are chatting to
  useEffect(() => {
    setTitle((prev) => ({
      ...prev,
      suffix: activePrivateChat.username
        ? ` - ${activePrivateChat.username}`
        : "",
    }));
  }, [activePrivateChat]);

  useEffect(() => {
    console.log(activePrivateChat);
  }, [activePrivateChat]);

  return (
    <ActivePrivateChatContext.Provider
      value={{ activePrivateChat, setActivePrivateChat }}
    >
      {children}
    </ActivePrivateChatContext.Provider>
  );
}
