import { useState } from 'react';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { ChatBox } from '../../components/ChatBox/ChatBox';
import { Modal } from '../../components/Modal/Modal';
import { InitialLoadingScreen } from '../../components/InitialLoadingScreen/InitialLoadingScreen';

export const Home = () => {
  const [activeChat, setActiveChat] = useState({});
  const [isSidebarOn, setIsSidebarOn] = useState(false); //will come to effect when screen is smaller than <lg

  return (
    <>
      <div className="min-h-screen flex">
        <Modal />
        <InitialLoadingScreen />
        <Sidebar
          setActiveChat={setActiveChat}
          sidebarState={{ isSidebarOn, setIsSidebarOn }}
        />
        <ChatBox
          activeChat={activeChat}
          sidebarState={{ isSidebarOn, setIsSidebarOn }}
        />
      </div>
    </>
  );
};
