import {
  useState,
  createContext,
  useReducer,
  useEffect,
  useContext,
} from 'react';
import messageLogsReducer from './messageLogsReducer';
import socket from '../../utils/socketClient/socketClient';
import MESSAGE_LOGS_ACTIONS from './messageLogsActions';
import { UserContext } from '../user/userContext';
import getUsersPreview from '../../utils/apis/getusersPreview';
import { ContactsContext } from '../contactContext/ContactContext';

const MESSAGE_LOGS_DEFAULT = {
  isStarting: true,
  isInitialLoading: false,
  isLoaded: false,
  isStartingUpdate: false,
  error: null,
  content: {
    // 1234: {
    //   activeChat: false,
    //   _id: "62c7a79be0bb1bb1e7f12007",
    //   chat: Array(5) [ {…}, {…}, {…}, … ]
    // },
  },
};
const MESSAGE_UNREAD_DEFAULT = { detail: {}, total: 0 };

export const MessageLogsContext = createContext(MESSAGE_LOGS_DEFAULT);

export default function MessageLogsContextProvider({ children }) {
  const [msgLogs, msgLogsDispatch] = useReducer(
    messageLogsReducer,
    MESSAGE_LOGS_DEFAULT
  );
  const { userState } = useContext(UserContext);
  const { contacts } = useContext(ContactsContext);
  const [msgUnread, setMsgUnread] = useState(MESSAGE_UNREAD_DEFAULT);

  // fetch all the message log from the server
  useEffect(() => {
    if (msgLogs.length > 0) return;

    msgLogsDispatch({ type: MESSAGE_LOGS_ACTIONS.initialLoading });
    socket.on('download-all-chats', (data) => {
      // assign the incoming chat data to an object
      const payload = {};

      for (const log of data.messageLogs) {
        payload[log.user._id] = {
          user: log.user,
          chatId: log.chatId,
          chat: log.chat,
        };
      }

      if (data.success) {
        msgLogsDispatch({ type: MESSAGE_LOGS_ACTIONS.loaded, payload });
      } else {
        msgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.loaded,
          payload: data.message,
        });
        console.error(error);
        socket.emit('error', data);
      }
    });

    return () => socket.off('download-all-chats');
  }, []);

  // refresh messageLog
  useEffect(() => {
    const refreshMsgLogs = () => {
      if (!userState.user || !userState) return;
      if (contacts.length === 0) return;

      msgLogsDispatch({ type: MESSAGE_LOGS_ACTIONS.startUpdate });
      const updatedMsgLogs = msgLogs;

      const newUserId = contacts[contacts.length - 1].user;

      // assemble the final result object
      getUsersPreview(sessionStorage.getItem('token'), [newUserId])
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
    socket.on('refresh-msg-log', refreshMsgLogs);

    return () => socket.off('refresh-msg-log');
  }, [userState, contacts, msgLogs]);

  // count unread messages
  useEffect(() => {
    if (Object.keys(msgLogs.content).length === 0) return;
    const msgEntries = msgLogs.content;
    const userId = userState.user._id;
    const result = MESSAGE_UNREAD_DEFAULT;

    const hasBeenReadOrMine = (chat, userId) => {
      if (chat.readAt !== null) return true;
      if (chat.by === userId) return true;
    };

    // only increments the Unread value if the last message sent by a user is Unread
    for (const by in msgEntries) {
      const lastMsg = msgEntries[by].chat.length - 1; //last index of the message log

      // check if the user has sent any messages
      if (lastMsg !== -1) {
        const chatLog = msgEntries[by].chat;
        const isLastMsgInvalid = hasBeenReadOrMine(chatLog[lastMsg], userId);

        // if the last message has been read or is not by this user then continue
        if (isLastMsgInvalid) continue;

        // loop over to see how many messages are Unread
        for (let i = chatLog.length - 1; i >= 0; i--) {
          const isMsgInvalid = hasBeenReadOrMine(chatLog[i], userId);

          // if the current message has been read or is not by this user then continue
          if (isMsgInvalid) continue;

          // increment the the unread value
          const currValue = result.detail[by] || 0;
          result.detail[by] = currValue + 1;
          result.total = result.total + 1;
        }
      }
    }
    setMsgUnread(result);
  }, [msgLogs]);

  useEffect(() => console.log(msgUnread), [msgUnread]);
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
  token,
  message = null,
  currentActiveChatId,
  msgLogs,
  dispatch,
}) => {
  dispatch({ type: MESSAGE_LOGS_ACTIONS.startUpdate });
  try {
    const [user] = await getUsersPreview(token, [targetId]);
    const isActiveChat = currentActiveChatId === targetId;
    const updatedMsgLogs = msgLogs;

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
  } catch (error) {
    console.log(error);
  }
};

export const pushNewMsgToEntry = ({ targetId, message, dispatch, msgLogs }) => {
  const updatedMsgLogs = msgLogs;
  updatedMsgLogs.content[targetId].chat.push(message);

  dispatch({
    type: MESSAGE_LOGS_ACTIONS.updateLoaded,
    payload: updatedMsgLogs.content,
  });
};
