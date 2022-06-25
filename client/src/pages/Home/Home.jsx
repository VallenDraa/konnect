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
import { useLocation } from 'react-router-dom';
import RenderIf from '../../utils/React/RenderIf';
import locationForModal from '../../components/Modal/utils/locationForModal';
import MODAL_ACTIONS from '../../context/modal/modalActions';

export const Home = () => {
  const [activeChat, setActiveChat] = useState({});
  const { modalState, modalDispatch } = useContext(ModalContext);
  const [isModalOn, setIsModalOn] = useState(false);
  const [isSidebarOn, setIsSidebarOn] = useState(false); //will come to effect when screen is smaller than <lg
  const { userState, userDispatch } = useContext(UserContext);
  const { isLoginViaRefresh } = useContext(IsLoginViaRefreshContext);
  const location = useLocation();

  // authorize user with socket.io, if the userState is not empty
  useEffect(() => {
    if (Object.keys(userState.user).length !== 0 && isLoginViaRefresh) {
      socket.emit('login', userState.user._id, (success, message) => {
        !success && alert(message);
      });
    }

    return () => socket.off('login');
  }, []);

  //the receiving end / recipient of an add contact request
  useEffect(() => {
    socket.on('receive-add-contact', (recipient, { username, _id }) => {
      if (recipient.success) {
        const { token, user } = recipient;

        userDispatch({ type: USER_ACTIONS.updateSuccess, payload: user });
        sessionStorage.setItem('token', token);

        console.log(
          `${username} has sent you a contact request, what is your response`
        );
      }
    });

    return () => socket.off('receive-add-contact');
  }, []);

  // for checking if the page needs to render the modal
  useEffect(() => {
    const willTurnOn = locationForModal(location.pathname);
    if (!willTurnOn) {
      // time for the modal closing animation to play
      setTimeout(() => {
        modalDispatch({ type: MODAL_ACTIONS.close });
        setIsModalOn(willTurnOn);
      }, 200);
    } else {
      setIsModalOn(willTurnOn);
    }
  }, [location]);

  return (
    <>
      <div className="min-h-screen">
        <RenderIf conditionIs={isModalOn}>
          <Modal />
        </RenderIf>
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
