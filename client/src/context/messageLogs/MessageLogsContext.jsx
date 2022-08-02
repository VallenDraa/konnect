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
  const { userState } = useContext(UserContext);
  const { contacts } = useContext(ContactsContext);
  const [msgUnread, setMsgUnread] = useState({ detail: {}, total: 0 });

  // fetch all the message log id from the server
  useEffect(() => {
    if (msgLogs.length > 0) return;
    socket.on(
      "download-all-chat-ids",
      ({ unreadMsg, messageLogs, success }) => {
        if (success) {
          // assign the incoming chat data to an object
          const result = {};

          for (const log of messageLogs) {
            result[log.user._id] = {
              chat: log.chat,
              user: log.user,
              chatId: log.chatId,
              preview: log.preview,
            };
          }

          msgLogsDispatch({
            type: MESSAGE_LOGS_ACTIONS.loaded,
            payload: result,
          });

          if (JSON.stringify(unreadMsg) !== JSON.stringify(msgUnread)) {
            setMsgUnread(unreadMsg);
          }
        }
      }
    );

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
            preview: false,
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
  // useEffect(() => console.log(msgLogs.content), [msgLogs]);

  return (
    <MessageLogsContext.Provider
      value={{ msgLogs, msgLogsDispatch, msgUnread, setMsgUnread }}
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
  msgLogsDispatch,
}) => {
  // dispatch({ type: MESSAGE_LOGS_ACTIONS.startUpdate });
  try {
    console.log(activeChat);
    const { lastMsg, isOnline, lastSeen, ...user } = activeChat;
    const isActiveChat = currentActiveChatId === targetId;
    const updatedChatLog = cloneDeep(msgLogs.content);
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
    }; // assemble the final result object

    updatedChatLog[targetId] = newChatLogContent;

    msgLogsDispatch({
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
  msgLogs,
  msgLogsDispatch,
}) => {
  const newChatLogs = cloneDeep(msgLogs.content);
  const timeGroup = newChatLogs[targetId];
  const latestTimeGroup = timeGroup.chat[timeGroup.chat.length - 1];
  const dateCurr = new Date(message.time).toLocaleDateString();

  latestTimeGroup.date === dateCurr
    ? latestTimeGroup.messages.push(message)
    : timeGroup.chat.push({ date: dateCurr, messages: [message] });

  msgLogsDispatch({
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
