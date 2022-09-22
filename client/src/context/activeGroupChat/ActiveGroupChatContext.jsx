import { useContext, createContext, useEffect, useState } from "react";
import { cloneDeep } from "lodash";
import MESSAGE_LOGS_ACTIONS from "../messageLogs/messageLogsActions";
import { TitleContext } from "../titleContext/TitleContext";
import { MessageLogsContext } from "../messageLogs/MessageLogsContext";

export const ActiveGroupChatContext = createContext("");

export default function ActiveGroupChatContextProvider({ children }) {
  const [activeGroupChat, setActiveGroupChat] = useState("");
  const { msgLogs } = useContext(MessageLogsContext);
  const { setTitle } = useContext(TitleContext);

  // change the web title according to the user we are chatting to
  useEffect(() => {
    if (!msgLogs.content[activeGroupChat]) {
      setTitle((prev) => ({ ...prev, suffix: "" }));
    } else {
      const suffix = msgLogs.content[activeGroupChat].name
        ? ` - ${msgLogs.content[activeGroupChat].name}`
        : "";

      setTitle((prev) => ({ ...prev, suffix }));
    }
  }, [activeGroupChat, msgLogs]);

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

export const makeNewGroup = ({
  chatId,
  name,
  users,
  createdAt,
  newNotice,
  msgLogs,
  msgLogsDispatch,
}) => {
  const updatedLogsContent = cloneDeep(msgLogs.content);
  const updatedMsgLogs = {
    [chatId]: {
      chatId,
      name,
      admins: users.admins,
      members: users.members,
      chat: [newNotice],
      type: "group",
      description: "",
      preview: true,
      profilePicture: "",
      createdAt,
    },
    ...updatedLogsContent,
  };

  // make a new group message log
  msgLogsDispatch({
    type: MESSAGE_LOGS_ACTIONS.updateLoaded,
    payload: updatedMsgLogs,
  });
};
