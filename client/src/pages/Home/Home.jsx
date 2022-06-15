import { useContext, useState } from 'react';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { ChatBox } from '../../components/ChatBox/ChatBox';
import { Modal } from '../../components/Modal/Modal';
import { InitialLoadingScreen } from '../../components/InitialLoadingScreen/InitialLoadingScreen';
import { ModalContext } from '../../context/Modal/modalContext';
import { useEffect } from 'react';
import { UserContext } from '../../context/User/userContext';
import socket from '../../utils/socketClient/socketClient';
import { IsLoginViaRefreshContext } from '../../context/isLoginViaRefresh/isLoginViaRefresh';

export const Home = () => {
  const [activeChat, setActiveChat] = useState({});
  const { modalState } = useContext(ModalContext);
  const [isSidebarOn, setIsSidebarOn] = useState(false); //will come to effect when screen is smaller than <lg
  const { userState, userDispatch } = useContext(UserContext);
  const { isLoginViaRefresh } = useContext(IsLoginViaRefreshContext);

  // authorize user with socket.io, if the userState is not empty
  useEffect(() => {
    if (Object.keys(userState.user).length !== 0 && isLoginViaRefresh) {
      socket.emit('login', userState.user._id, (success, message) => {
        !success && alert(message);
      });
    }
  }, []);

  return (
    <>
      <div className="min-h-screen">
        <Modal />
        <InitialLoadingScreen />
        <div
          className={`flex ${modalState.isActive && 'blur-sm'} duration-200`}
        >
          <Sidebar
            setActiveChat={setActiveChat}
            sidebarState={{ isSidebarOn, setIsSidebarOn }}
          />
          <ChatBox
            activeChat={activeChat}
            sidebarState={{ isSidebarOn, setIsSidebarOn }}
          />
        </div>
      </div>
    </>
  );
};
