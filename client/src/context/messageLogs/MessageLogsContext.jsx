import { createContext, useReducer, useEffect } from 'react';
import messageLogsReducer from './messageLogsReducer';
import socket from '../../utils/socketClient/socketClient';
import MESSAGE_LOGS_ACTIONS from './messageLogsActions';

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

  useEffect(() => {
    console.log(msgLogs);
  }, [msgLogs]);

  return (
    <MessageLogsContext.Provider value={{ msgLogs, msgLogsDispatch }}>
      {children}
    </MessageLogsContext.Provider>
  );
}
