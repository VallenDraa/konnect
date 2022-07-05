import { ChatPreview } from './ChatPreview/ChatPreview';
import { useState } from 'react';
import RenderIf from '../../../../utils/React/RenderIf';

const ChatList = ({ setActiveChat, setIsSidebarOn }) => {
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
            key={chat.id}
            chat={chat}
            handleActiveChat={handleActiveChat}
          />
        ))}
      </RenderIf>
    </ul>
  );
};

export default ChatList;
