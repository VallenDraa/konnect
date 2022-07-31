import {
  useState,
  createContext,
  useReducer,
  useEffect,
  useContext,
} from "react";
import messageLogsReducer from "./messageLogsReducer";
import socket from "../../utils/socketClient/socketClient";
import MESSAGE_LOGS_ACTIONS from "./messageLogsActions";
import { UserContext } from "../user/userContext";
import getUsersPreview from "../../utils/apis/getusersPreview";
import { ContactsContext } from "../contactContext/ContactContext";
import { cloneDeep } from "lodash";

const MESSAGE_LOGS_DEFAULT = {
  isStarting: true,
  isInitialLoading: false,
  isLoaded: false,
  isStartingUpdate: false,
  error: null,
  content: {},
};

export const MessageLogsContext = createContext(MESSAGE_LOGS_DEFAULT);

export default function MessageLogsContextProvider({ children }) {
  const [msgLogs, msgLogsDispatch] = useReducer(
    messageLogsReducer,
    MESSAGE_LOGS_DEFAULT
  );
  const [newMsgLogs, newMsgLogsDispatch] = useReducer(
    messageLogsReducer,
    MESSAGE_LOGS_DEFAULT
  );
  const { userState } = useContext(UserContext);
  const { contacts } = useContext(ContactsContext);
  const [msgUnread, setMsgUnread] = useState({ detail: {}, total: 0 });

  // fetch all the message log id from the server
  useEffect(() => {
    if (newMsgLogs.length > 0) return;
    socket.on("download-all-chat-ids", ({ messageLogs, success }) => {
      if (success) {
        // assign the incoming chat data to an object
        const result = {};

        for (const log of messageLogs) {
          result[log.user._id] = {
            chat: [
              {
                date: new Date(log.chat[0].time).toLocaleDateString(),
                messages: log.chat,
              },
            ],
            user: log.user,
            chatId: log.chatId,
            preview: log.preview,
          };
        }

        newMsgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.loaded,
          payload: result,
        });
      }
    });

    return () => socket.off("download-all-chats");
  }, []);

  // fetch all the message log id from the server
  useEffect(() => {
    if (msgLogs.length > 0) return;
    socket.on("download-all-chat-ids", (data) => {
      if (data.success) {
        // assign the incoming chat data to an object

        const payload = {};
        for (const log of data.messageLogs) {
          payload[log.user._id] = {
            user: log.user,
            chatId: log.chatId,
            chat: log.chat,
            preview: log.preview,
          };
        }

        // update the msgLogs
        msgLogsDispatch({ type: MESSAGE_LOGS_ACTIONS.loaded, payload });
        if (JSON.stringify(data.unreadMsg) !== JSON.stringify(msgUnread)) {
          setMsgUnread(data.unreadMsg);
        }
      } else {
        msgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.error,
          payload: data.message,
        });
        console.error(error);
        socket.emit("error", data);
      }
    });

    return () => socket.off("download-all-chats");
  }, []);

  /* refresh messageLog*/
  useEffect(() => {
    const refreshMsgLogs = () => {
      if (!userState.user || !userState) return;
      if (contacts.length === 0) return;

      msgLogsDispatch({ type: MESSAGE_LOGS_ACTIONS.startUpdate });
      const updatedMsgLogs = cloneDeep(msgLogs);

      const newUserId = contacts[contacts.length - 1].user;

      // assemble the final result object
      getUsersPreview(sessionStorage.getItem("token"), [newUserId])
        .then(([user]) => {
          const newMessageLogContent = {
            user, //this'll get the last user (new user) in the contact array
            chatId: null,
            chat: [],
            activeChat: false,
          };
          updatedMsgLogs.content[newUserId] = newMessageLogContent;

          // save the new message log
          msgLogsDispatch({
            type: MESSAGE_LOGS_ACTIONS.updateLoaded,
            payload: updatedMsgLogs.content,
          });
        })
        .catch((e) => {
          msgLogsDispatch({
            type: MESSAGE_LOGS_ACTIONS.updateError,
            payload: e,
          });
        });
    };
    socket.on("refresh-msg-log", refreshMsgLogs);

    return () => socket.off("refresh-msg-log");
  }, [userState, contacts, msgLogs]);

  // useEffect(() => console.log(msgUnread), [msgUnread]);
  // useEffect(() => console.log(msgLogs), [msgLogs]);
  // useEffect(() => console.log(newMsgLogs), [newMsgLogs]);

  return (
    <MessageLogsContext.Provider
      value={{
        msgLogs,
        msgLogsDispatch,
        newMsgLogs,
        newMsgLogsDispatch,
        msgUnread,
        setMsgUnread,
      }}
    >
      {children}
    </MessageLogsContext.Provider>
  );
}

export const pushNewEntry = async ({
  targetId,
  activeChat,
  message = null,
  currentActiveChatId,
  msgLogs,
  dispatch,
  newMsgLogs,
  newMsgLogsDispatch,
}) => {
  dispatch({ type: MESSAGE_LOGS_ACTIONS.startUpdate });
  try {
    const { lastMsg, isOnline, lastSeen, ...user } = activeChat;
    const isActiveChat = currentActiveChatId === targetId;
    const updatedMsgLogs = cloneDeep(msgLogs);

    // assemble the final result object
    const newMessageLogContent = {
      user,
      chatId: message ? message.chatId : null,
      chat: message ? [message] : [],
      activeChat: isActiveChat,
    };
    updatedMsgLogs.content[targetId] = newMessageLogContent;

    // save the new message log
    dispatch({
      type: MESSAGE_LOGS_ACTIONS.updateLoaded,
      payload: updatedMsgLogs.content,
    });

    /**  NEW MSG LOGS */
    const updatedChatLog = cloneDeep(newMsgLogs.content);
    // assemble the final result object
    const newChatLogContent = {
      user,
      chatId: message.chatId,
      chat: [
        {
          date: new Date(message.time).toLocaleDateString(),
          messages: [message],
        },
      ],
      activeChat: isActiveChat,
    };
    updatedChatLog[targetId] = newChatLogContent;

    newMsgLogsDispatch({
      type: MESSAGE_LOGS_ACTIONS.updateLoaded,
      payload: updatedChatLog,
    });
  } catch (error) {
    console.log(error);
  }
};

export const pushNewMsgToEntry = ({
  targetId,
  message,
  dispatch,
  msgLogs,
  newMsgLogs,
  newMsgLogsDispatch,
}) => {
  const updatedMsgLogs = cloneDeep(msgLogs);
  updatedMsgLogs.content[targetId].chat.push(message);

  dispatch({
    type: MESSAGE_LOGS_ACTIONS.updateLoaded,
    payload: updatedMsgLogs.content,
  });

  /*NEW MSG LOGS */
  const newChatLogs = cloneDeep(newMsgLogs.content);
  const timeGroup = newChatLogs[targetId];
  const latestTimeGroup = timeGroup.chat[timeGroup.chat.length - 1];
  const dateCurr = new Date(message.time).toLocaleDateString();

  latestTimeGroup.date === dateCurr
    ? latestTimeGroup.messages.push(message)
    : timeGroup.chat.push({ date: dateCurr, messages: [message] });

  newMsgLogsDispatch({
    type: MESSAGE_LOGS_ACTIONS.updateLoaded,
    payload: newChatLogs,
  });
};

export const incrementMsgUnread = ({ msgUnread, setMsgUnread, chatId }) => {
  const updatedMsgUnread = cloneDeep(msgUnread);

  const currentNotifValue = updatedMsgUnread.detail[chatId] || 0;

  updatedMsgUnread.detail[chatId] = currentNotifValue + 1;
  updatedMsgUnread.total = updatedMsgUnread.total + 1;

  setMsgUnread(updatedMsgUnread);
};

export const removeMsgUnread = ({ msgUnread, setMsgUnread, chatId }) => {
  const updatedMsgUnread = cloneDeep(msgUnread);

  const currentNotifValue = updatedMsgUnread.detail[chatId] || 0;

  delete updatedMsgUnread.detail[chatId];
  updatedMsgUnread.total = updatedMsgUnread.total - currentNotifValue;

  setMsgUnread(updatedMsgUnread);
};
