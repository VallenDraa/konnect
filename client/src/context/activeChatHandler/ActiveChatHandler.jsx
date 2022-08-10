import { cloneDeep, update } from "lodash";
import { createContext, useCallback, useContext } from "react";
import { ActiveGroupChatContext } from "../activeGroupChat/ActiveGroupChatContext";
import {
  ActivePrivateChatContext,
  ACTIVE_PRIVATE_CHAT_DEFAULT,
} from "../activePrivateChat/ActivePrivateChatContext";
import MESSAGE_LOGS_ACTIONS from "../messageLogs/messageLogsActions";
import { MessageLogsContext } from "../messageLogs/MessageLogsContext";

export const ActiveChatHandlerContext = createContext(null);

export default function ActiveChatHandlerProvider({ children }) {
  const { msgLogs, msgLogsDispatch } = useContext(MessageLogsContext);
  const { setActiveGroupChat } = useContext(ActiveGroupChatContext);
  const { setActivePrivateChat } = useContext(ActivePrivateChatContext);

  const makeNewGroup = (chatId, name, users, newNotice) => {
    const updatedMsgLogs = cloneDeep(msgLogs.content);

    updatedMsgLogs[chatId] = {
      chatId,
      name,
      admins: users.admins,
      members: users.members,
      chat: [newNotice],
      type: "group",
    };
    // make a new group message log
    msgLogsDispatch({
      type: MESSAGE_LOGS_ACTIONS.updateLoaded,
      payload: updatedMsgLogs,
    });

    // set the active group
    setActiveGroupChat(chatId);

    // deactive private chat
    setActivePrivateChat(ACTIVE_PRIVATE_CHAT_DEFAULT);
  };

  return (
    <ActiveChatHandlerContext.Provider value={{ makeNewGroup }}>
      {children}
    </ActiveChatHandlerContext.Provider>
  );
}
