import { ChatPreview } from './ChatPreview/ChatPreview';
import { useContext, useEffect, useState } from 'react';
import RenderIf from '../../../../utils/React/RenderIf';
import getUsersPreview from '../../../../utils/apis/getusersPreview';
import { ActiveChatContext } from '../../../../context/activeChat/ActiveChatContext';
import { MessageLogsContext } from '../../../../context/messageLogs/MessageLogsContext';
import MESSAGE_LOGS_ACTIONS from '../../../../context/messageLogs/messageLogsActions';

export default function ChatList({ setIsSidebarOn }) {
  const { setActiveChat } = useContext(ActiveChatContext);
  const { msgLogs, msgLogsDispatch } = useContext(MessageLogsContext);
  const [logsEntries, setLogsEntries] = useState(
    Object.entries(msgLogs.content)
  );

  // refresh the entries everytime the msgLogs is updated
  useEffect(() => setLogsEntries(Object.entries(msgLogs.content)), [msgLogs]);

  const handleActiveChat = (target) => {
    if (!target) return;

    const updatedMsgLogs = msgLogs;

    for (const id in updatedMsgLogs.content) {
      // see if the value is already in the correct state
      if (updatedMsgLogs.content[id].activeChat === (id === target._id)) {
        continue;
      }

      updatedMsgLogs.content[id].activeChat = id === target._id;
      if (updatedMsgLogs.content[id].activeChat) {
        setActiveChat({ ...updatedMsgLogs.content[id].user });
      }
    }

    msgLogsDispatch({
      type: MESSAGE_LOGS_ACTIONS.updateLoaded,
      payload: updatedMsgLogs.content,
    });

    // close sidebar for smaller screen
    setIsSidebarOn(false);
  };

  return (
    <ul className="space-y-3 py-3">
      {/* if chat history doesn't exist'*/}
      <RenderIf conditionIs={logsEntries.length === 0}>Empty</RenderIf>

      {/* if chat history exists */}
      <RenderIf conditionIs={logsEntries.length > 0}>
        {logsEntries.map(([_id, { user, chat, activeChat }]) => {
          return (
            <ChatPreview
              key={_id}
              lastMessage={chat[chat.length - 1]}
              user={user}
              isActive={activeChat}
              handleActiveChat={handleActiveChat}
            />
          );
        })}
      </RenderIf>
    </ul>
  );
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
