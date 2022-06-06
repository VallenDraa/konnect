import { ChatPreview } from '../ChatPreview/ChatPreview';
import { useState } from 'react';

export const ChatList = ({ setActiveChat, setIsSidebarOn }) => {
  const [chats, setChats] = useState([
    {
      username: 'john',
      id: '1',
      lastMessage: {
        type: 'text',
        content: 'Lorem ipsum dolor sit',
        by: 'me',
      },
      activeChat: false,
    },
    {
      username: 'steve',
      id: '2',
      lastMessage: {
        type: 'call',
        content: 'Call Lasted For 4:20:00',
        by: 'steve',
      },
      activeChat: false,
    },
    {
      username: 'jake',
      id: '3',
      lastMessage: {
        type: 'image',
        content: 'Image',
        by: 'me',
      },
      activeChat: false,
    },
    {
      username: 'david',
      id: '4',
      lastMessage: {
        type: 'video',
        content: 'Video',
        by: 'david',
      },
      activeChat: false,
    },
  ]);

  const handleActiveChat = (target) => {
    const updatedChat = chats.map((chat) => {
      if (chat !== target) {
        return { ...chat, activeChat: false }; //innactive chat
      } else {
        const { username, lastMessage } = chat;
        setActiveChat({ username, lastMessage }); //active chat
        return { ...chat, activeChat: true };
      }
    });

    setChats(updatedChat);
    // close sidebar for smaller screen
    setIsSidebarOn(false);
  };
  return (
    <ul className="space-y-3 py-3">
      {chats.map((chat) => (
        <ChatPreview
          key={chat.id}
          chat={chat}
          handleActiveChat={handleActiveChat}
        />
      ))}
    </ul>
  );
};
