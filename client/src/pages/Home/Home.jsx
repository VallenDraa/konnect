import { useContext, useState } from 'react';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { ChatBox } from '../../components/ChatBox/ChatBox';
import { Modal } from '../../components/modal/Modal';
import { InitialLoadingScreen } from '../../components/InitialLoadingScreen/InitialLoadingScreen';
import { ModalContext } from '../../context/modal/modalContext';
import { useEffect } from 'react';
import { UserContext } from '../../context/user/userContext';
import socket from '../../utils/socketClient/socketClient';
import { IsLoginViaRefreshContext } from '../../context/isLoginViaRefresh/isLoginViaRefresh';
import USER_ACTIONS from '../../context/user/userAction';

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

    return () => socket.off('login');
  }, []);

  // refresh userState after sending an add contact request
  useEffect(() => {
    socket.on('update-client-data', (queueResponse) => {
      if (queueResponse.success) {
        const { user, token } = queueResponse;

        userDispatch({ type: USER_ACTIONS.updateSuccess, payload: user });
        sessionStorage.setItem('token', token);
      } else {
        console.log(queueResponse.message);
      }
    });

    return () => socket.off('update-client-data');
  }, []);

  //the receiving end / recipient of an add contact request
  useEffect(() => {
    socket.on('receive-add-contact', (recipient, { username, _id }) => {
      if (recipient.success) {
        const { token, user } = recipient;

        userDispatch({ type: USER_ACTIONS.updateSuccess, payload: user });
        sessionStorage.setItem('token', token);

        const ans = confirm(
          `${username} has sent you a contact request, what is your response`
        );
        console.log('answer: ' + ans);
      } else {
        console.log(recipient.message);
      }
    });

    return () => socket.off('receive-add-contact');
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
