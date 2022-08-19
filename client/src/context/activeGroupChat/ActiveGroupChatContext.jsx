import { useContext } from "react";
import { createContext, useEffect, useState } from "react";
import { TitleContext } from "../titleContext/TitleContext";

export const ActiveGroupChatContext = createContext("");

export default function ActiveGroupChatContextProvider({ children }) {
  const [activeGroupChat, setActiveGroupChat] = useState("");

  // useEffect(() => {
  //   console.log(activeGroupChat);
  // }, [activeGroupChat]);

  return (
    <ActiveGroupChatContext.Provider
      value={{ activeGroupChat, setActiveGroupChat }}
    >
      {children}
    </ActiveGroupChatContext.Provider>
  );
}
