import { useContext } from "react";
import { createContext, useEffect, useState } from "react";
import { TitleContext } from "../titleContext/TitleContext";

export const ACTIVE_PRIVATE_CHAT_DEFAULT = {
  _id: null,
  initials: null,
  lastMessage: null,
  profilePicture: null,
  username: null,
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

// export const handleActiveChat = ({
//   target,
//   activeChat,
//   setActiveChat,
//   msgLogs,
//   setIsSidebarOn,
//   ACTIVE_PRIVATE_CHAT_DEFAULT,
// }) => {
//   // changing the active chat
//   if (!target) return;

//   // check if target id is the same as the current one, if so deactivate it
//   if (target._id !== activeChat._id) {
//     if (msgLogs.content[target._id]) {
//       const { chat } = msgLogs.content[target._id];

//       setActiveChat({
//         ...target,
//         lastMessage: chat.length > 0 ? chat[chat.length - 1] : null,
//       });
//     }
//   } else {
//     setActiveChat(ACTIVE_PRIVATE_CHAT_DEFAULT);
//   }

//   // close sidebar for smaller screen
//   if (setIsSidebarOn) {
//     setIsSidebarOn(false);
//   }
// };
