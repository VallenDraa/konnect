import { createContext, useReducer, useEffect, useContext } from 'react';
import messageLogsReducer from './messageLogsReducer';
import socket from '../../utils/socketClient/socketClient';
import MESSAGE_LOGS_ACTIONS from './messageLogsActions';
import { UserContext } from '../user/userContext';
import getUsersPreview from '../../utils/apis/getusersPreview';

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

export const MessageLogsContext = createContext(MESSAGE_LOGS_DEFAULT);

export default function MessageLogsContextProvider({ children }) {
  const [msgLogs, msgLogsDispatch] = useReducer(
    messageLogsReducer,
    MESSAGE_LOGS_DEFAULT
  );
  const { userState } = useContext(UserContext);
  // const { activeChat } = useContext(ActiveChatContext);
  // const [contactLength, setContactLength] = useState(0);
  // check if the amount of contacts has changed
  // useEffect(() => {
  //   if (!userState.user) return;
  //   const newContactLength = userState.user.contacts.length;

  //   setContactLength(newContactLength);
  // }, [userState]);
  const refreshMsgLogs = () => {
    msgLogsDispatch({ type: MESSAGE_LOGS_ACTIONS.startUpdate });
    const updatedMsgLogs = msgLogs;

    const newUserId =
      userState.user.contacts[userState.user.contacts.length - 1].user;

    // assemble the final result object

    getUsersPreview(sessionStorage.getItem('token'), [newUserId])
      .then(([user]) => {
        const newMessageLogContent = {
          user, //this'll get the last user (new user) in the contact array
          lastMessageReadAt: null,
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
          chat: log.chat,
          lastMessageReadAt: log.lastMessageReadAt,
          activeChat: false,
        };
      }

      try {
      } catch (error) {}
      if (data.success) {
        msgLogsDispatch({ type: MESSAGE_LOGS_ACTIONS.loaded, payload });
      } else {
        msgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.loaded,
          payload: data.message,
        });
        socket.emit('error', data.message);
      }
    });

    return () => socket.off('download-all-chats');
  }, []);

  // refresh messageLog
  useEffect(() => {
    socket.on('refresh-msg-log', refreshMsgLogs);

    return () => socket.off('refresh-msg-log');
  }, []);

  // useEffect(() => console.log(msgLogs), [msgLogs]);

  return (
    <MessageLogsContext.Provider value={{ msgLogs, msgLogsDispatch }}>
      {children}
    </MessageLogsContext.Provider>
  );
}
