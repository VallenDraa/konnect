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

  return (
    <ActiveChatHandlerContext.Provider value={""}>
      {children}
    </ActiveChatHandlerContext.Provider>
  );
}
