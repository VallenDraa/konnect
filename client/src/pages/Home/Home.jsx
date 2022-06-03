import { useState } from 'react';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { ChatBox } from '../../components/ChatBox/ChatBox';

export const Home = () => {
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
  const [activeChat, setActiveChat] = useState({});

  const [sidebarOn, setSidebarOn] = useState(false); //will come to effect when screen is smaller than <lg

  return (
    <div className="min-h-screen flex">
      <Sidebar
        chatState={{ chats, setChats }}
        setActiveChat={setActiveChat}
        sidebarState={sidebarOn}
      />
      <ChatBox
        activeChat={activeChat}
        sidebarState={{ sidebarOn, setSidebarOn }}
      />
    </div>
  );
};
