import { ChatPreview } from './ChatPreview/ChatPreview';
import { useContext, useEffect, useState } from 'react';
import RenderIf from '../../../../utils/React/RenderIf';
import getUsersPreview from '../../../../utils/apis/getusersPreview';

const ChatList = ({ contacts, setActiveChat, setIsSidebarOn }) => {
  const [chats, setChats] = useState([
    // {
    //   username: 'john',
    //   id: '1',
    //   lastMessage: {
    //     type: 'text',
    //     content: 'Lorem ipsum dolor sit',
    //     by: 'me',
    //   },
    //   activeChat: false,
    // },
  ]);

  // set chats state based on the user contact
  useEffect(() => {
    // both index will match
    const lastMessages = {};
    const usersPreviewToBeFetched = [];

    for (const user of contacts) {
      if (user.chat.length === 0) continue;

      // add the last message to the last messages object
      lastMessages[user.user] = user.chat[0];
      usersPreviewToBeFetched.push(user.user);
    }

    getUsersPreview(sessionStorage.getItem('token'), usersPreviewToBeFetched)
      .then((result) => {
        const finalResults = [];

        // assemble the final result which includes (username, id, lastMessage, initials, profilePicture)
        for (const preview of result) {
          finalResults.push({
            ...preview,
            lastMessage: lastMessages[preview._id],
          });
        }

        setChats(finalResults);
      })
      .catch((e) => console.log(e));
  }, [contacts]);

  const handleActiveChat = (target) => {
    const updatedChat = chats.map((chat) => {
      if (chat !== target) {
        return { ...chat, activeChat: false }; //innactive chat
      } else {
        setActiveChat(chat); //active chat
        return { ...chat, activeChat: true };
      }
    });

    setChats(updatedChat);
    // close sidebar for smaller screen
    setIsSidebarOn(false);
  };

  return (
    <ul className="space-y-3 py-3">
      {/* if chat history doesn't exist'*/}
      <RenderIf conditionIs={chats.length === 0}>Empty</RenderIf>

      {/* if chat history exists */}
      <RenderIf conditionIs={chats.length !== 0}>
        {chats.map((chat) => (
          <ChatPreview
            key={chat._id}
            chat={chat}
            handleActiveChat={handleActiveChat}
          />
        ))}
      </RenderIf>
    </ul>
  );
};

export default ChatList;
