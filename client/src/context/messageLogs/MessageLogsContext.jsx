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
  content: {
    // if it is a private chat then use the user id as the key
    // else just use the group id as the  key
  },
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
            switch (log.type) {
              case "private":
                result[log.user._id] = {
                  chat: log.chat,
                  user: log.user,
                  type: log.type,
                  chatId: log.chatId,
                  preview: log.preview,
                };
                break;

              case "group":
                result[log.chatId] = {
                  name: log.name,
                  profilePicture: log.profilePicture,
                  chat: log.chat,
                  admins: log.admins,
                  members: log.members,
                  hasQuit: log.hasQuit,
                  type: log.type,
                  chatId: log.chatId,
                  description: log.description,
                  preview: log.preview,
                  createdAt: log.createdAt,
                };

                // automatically join the group chat room via websocket
                if (!log.hasQuit.some((u) => u.user === userState.user?._id)) {
                  socket.emit("join-room", log.chatId);
                }
                break;

              default:
                console.log(log);
                break;
            }
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
  }, [userState.user]);

  /* refresh messageLog*/
  useEffect(() => {
    const refreshMsgLogs = () => {
      if (!userState.user) return;
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
  }, [userState.user, contacts, msgLogs]);

  // useEffect(() => console.log(msgUnread), [msgUnread]);
  useEffect(() => console.log(msgLogs.content), [msgLogs]);

  return (
    <MessageLogsContext.Provider
      value={{
        msgLogs,
        msgLogsDispatch,
        msgUnread,
        setMsgUnread,
      }}
    >
      {children}
    </MessageLogsContext.Provider>
  );
}

export const pushNewPrivateEntry = async ({
  type, //private or group
  targetId,
  message = null,
  token,
  msgLogs,
  msgLogsDispatch,
  chatId = null,
}) => {
  // dispatch({ type: MESSAGE_LOGS_ACTIONS.startUpdate });
  try {
    const user = {};

    const [userPreview] = await getUsersPreview(token, [targetId]);
    Object.assign(user, userPreview);

    const updatedChatLog = cloneDeep(msgLogs.content);
    const newChatLogContent = {
      user,
      chatId,
      chat: [
        {
          date: new Date(message.time).toLocaleDateString(),
          messages: [message],
        },
      ],
      type,
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
