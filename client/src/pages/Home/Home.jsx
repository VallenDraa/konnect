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
import locationForModal from '../../components/Modal/utils/locationForModal';
import MODAL_ACTIONS from '../../context/modal/modalActions';
import MiniModal from '../../components/MiniModal/MiniModal';
import useUrlHistory from '../../utils/useUrlHistory/useUrlHistory';
import { ActiveChatContext } from '../../context/activeChat/ActiveChatContext';

export default function Home() {
  const { activeChat } = useContext(ActiveChatContext);
  const { modalState, modalDispatch } = useContext(ModalContext);
  const [isSidebarOn, setIsSidebarOn] = useState(false); //will come to effect when screen is smaller than <lg
  const { userState, userDispatch } = useContext(UserContext);
  const { isLoginViaRefresh } = useContext(IsLoginViaRefreshContext);
  const location = useLocation();
  const [urlHistory, urlHistoryError] = useUrlHistory();

  useEffect(() => {
    urlHistoryError && console.log(urlHistoryError, 'history error');
  }, [urlHistoryError]);

  // authorize user with socket.io, if the userState is not empty
  useEffect(() => {
    if (Object.keys(userState.user).length !== 0 && isLoginViaRefresh) {
      socket.emit(
        'login',
        { userId: userState.user._id, token: sessionStorage.getItem('token') },
        (success, message) => !success && alert(message)
      );
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

  // update sender data when the recipient accepts or rejects a contact request
  useEffect(() => {
    socket.on('receive-contact-request-response', (data) => {
      userDispatch({ type: USER_ACTIONS.updateStart });
      const { success, token, user } = data;

      if (success) {
        sessionStorage.setItem('token', token);
        userDispatch({ type: USER_ACTIONS.updateSuccess, payload: user });
      } else {
        userDispatch({ type: USER_ACTIONS.updateFail, payload: data.message });
      }
    });

    return () => socket.off('receive-contact-request-response');
  }, []);

  // refresh userState
  useEffect(() => {
    socket.off('update-client-data');

    socket.on('update-client-data', (newData) => {
      if (newData.success) {
        const { user, token } = newData;

        userDispatch({ type: USER_ACTIONS.updateSuccess, payload: user });
        sessionStorage.setItem('token', token);
      } else {
        console.log(newData.message);
      }
    });

    return () => socket.off('update-client-data');
  }, [location]);

  // for checking if the page needs to render the modal
  useEffect(() => {
    const willTurnOn = locationForModal(location.pathname);

    if (!willTurnOn) {
      // time for the modal closing animation to play
      setTimeout(() => modalDispatch({ type: MODAL_ACTIONS.close }), 200);
    }
  }, [location]);

  // if there is any socket error
  useEffect(() => {
    socket.on('error', (err) => console.log(err));

    return () => socket.off('error');
  }, []);

  return (
    <>
      <div className="min-h-screen max-w-screen-2xl shadow-xl mx-auto">
        <MiniModal />
        <Modal />
        <InitialLoadingScreen />
        <div
          className={`flex duration-200
                     ${modalState.isActive ? 'blur-sm' : ''}`}
        >
          <Sidebar
            urlHistory={urlHistory}
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
}
