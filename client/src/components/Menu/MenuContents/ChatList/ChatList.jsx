import { ChatPreview } from './ChatPreview/ChatPreview';
import { useContext, useEffect, useState } from 'react';
import RenderIf from '../../../../utils/React/RenderIf';
import emptyContactList from '../../../../svg/searchList/contactList/InitialSvg.svg';
import {
  ActiveChatContext,
  ACTIVE_CHAT_DEFAULT,
} from '../../../../context/activeChat/ActiveChatContext';
import { MessageLogsContext } from '../../../../context/messageLogs/MessageLogsContext';
import MESSAGE_LOGS_ACTIONS from '../../../../context/messageLogs/messageLogsActions';
import { useNavigate } from 'react-router-dom';

export default function ChatList({ setIsSidebarOn }) {
  const { activeChat, setActiveChat } = useContext(ActiveChatContext);
  const { msgLogs, msgLogsDispatch } = useContext(MessageLogsContext);
  const [logsEntries, setLogsEntries] = useState(
    msgLogs?.content ? Object.entries(msgLogs?.content) : []
  );
  const navigate = useNavigate();

  // refresh the entries everytime the msgLogs is updated
  useEffect(() => {
    if (!msgLogs || !msgLogs.content) return;

    const newEntries = Object.entries(msgLogs.content);

    // check if the new message logs and current one is the same
    if (
      JSON.stringify(Object.fromEntries(newEntries)) !==
      JSON.stringify(Object.fromEntries(logsEntries))
    ) {
      setLogsEntries(newEntries);
    }
  }, [msgLogs]);
  // useEffect(() => {
  //   console.log(logsEntries);
  // }, [logsEntries]);

  const handleActiveChat = (target) => {
    // changing the active chat
    if (!target) return;

    // check if target id is the same as the current one, if so deactivate it
    if (target._id !== activeChat._id) {
      const { lastMessageReadAt, chat } = msgLogs.content[target._id];

      setActiveChat({
        ...target,
        lastMessageReadAt,
        lastMessage: chat.length > 0 ? chat[chat.length - 1] : null,
      });
    } else {
      setActiveChat(ACTIVE_CHAT_DEFAULT);
    }

    // close sidebar for smaller screen
    setIsSidebarOn(false);
  };
  const EmptyPlaceholder = () => {
    return (
      <div className="text-center space-y-10 mt-10 p-3">
        <img src={emptyContactList} alt="" className="max-w-[300px] mx-auto" />
        <span className="block font-semibold text-xl md:text-lg text-gray-500">
          Chat List Is Empty
        </span>
        <span className="text-gray-400 text-xs">
          Go start a chat by pressing{' '}
          <span className="font-semibold text-gray-500">New Chat !</span>
        </span>
      </div>
    );
  };

  // determine what to return base on logsEntries length
  if (logsEntries.length === 0) {
    return <EmptyPlaceholder />;
  } else {
    const allChatIsEmpty = logsEntries.every(
      ([key, value]) => value.chat?.length === 0
    );

    if (allChatIsEmpty) {
      return <EmptyPlaceholder />;
    } else {
      return (
        <ul className="p-3 space-y-2">
          {/* if chat history exists */}
          <RenderIf conditionIs={logsEntries.length > 0}>
            {logsEntries.map(([_id, { user, chat }]) => {
              if (!user) return;
              return (
                <ChatPreview
                  key={_id}
                  lastMessage={chat[chat.length - 1]}
                  user={user}
                  isActive={_id === activeChat._id}
                  handleActiveChat={handleActiveChat}
                />
              );
            })}
          </RenderIf>
        </ul>
      );
    }
  }
}

// unused code
// const [chats, setChats] = useState([
//   // {
//   //   username: 'john',
//   //   id: '1',
//   //   lastMessage: {
//   //     type: 'text',
//   //     content: 'Lorem ipsum dolor sit',
//   //     by: 'me',
//   //   },
//   //   activeChat: false,
//   // },
// ]);
// set chats state based on the user contact
// useEffect(() => {
//   if (Object.keys(msgLogs.content).length === 0) return;
//   // both index will match
//   const lastMessages = {};
//   const usersPreviewToBeFetched = [];

//   for (const id in msgLogs.content) {
//     const logs = msgLogs.content;

//     if (logs[id].chat.length === 0) continue;

//     // add the last message to the last messages object
//     lastMessages[id] = logs[id].chat[logs[id].chat.length - 1];
//     usersPreviewToBeFetched.push(id);
//   }

//   getUsersPreview(sessionStorage.getItem('token'), usersPreviewToBeFetched)
//     .then((result) => {
//       const finalResults = [];

//       // assemble the final result which includes (username, id, lastMessage, initials, profilePicture)
//       for (const preview of result) {
//         finalResults.push({
//           ...preview,
//           activeChat: activeChat._id === preview._id,
//           lastMessage: lastMessages[preview._id],
//         });
//       }
//       setChats(finalResults);
//     })
//     .catch((e) => console.log(e));
// }, [msgLogs]);
