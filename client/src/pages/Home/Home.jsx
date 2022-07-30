import { createContext, useContext, useState } from "react";
import { Sidebar } from "../../components/Sidebar/Sidebar";
import { ChatBox } from "../../components/ChatBox/ChatBox";
import { Modal } from "../../components/modal/Modal";
import { InitialLoadingScreen } from "../../components/InitialLoadingScreen/InitialLoadingScreen";
import { ModalContext } from "../../context/modal/modalContext";
import { ContactsContext } from "../../context/contactContext/ContactContext";
import { useEffect } from "react";
import { UserContext } from "../../context/user/userContext";
import {
  NotifContext,
  receiveCancelAddContact,
  receiveContactRequestResponse,
  receiveSendAddContact,
} from "../../context/notifContext/NotifContext";
import { ActiveChatContext } from "../../context/activeChat/ActiveChatContext";
import { IsLoginViaRefreshContext } from "../../context/isLoginViaRefresh/isLoginViaRefresh";
import { useLocation } from "react-router-dom";
import socket from "../../utils/socketClient/socketClient";
import USER_ACTIONS from "../../context/user/userAction";
import NOTIF_CONTEXT_ACTIONS from "../../context/notifContext/notifContextActions";
import MODAL_ACTIONS from "../../context/modal/modalActions";
import locationForModal from "../../components/Modal/utils/locationForModal";
import MiniModal from "../../components/MiniModal/MiniModal";
import useUrlHistory from "../../utils/React/hooks/useUrlHistory/useUrlHistory";
import ChatboxContextProvider from "../../context/chatBoxState/chatBoxContext";

// url history context
export const UrlHistoryContext = createContext(null);
export const SidebarContext = createContext(null);

export default function Home() {
  const { activeChat } = useContext(ActiveChatContext);
  const { modalState, modalDispatch } = useContext(ModalContext);
  const [isSidebarOn, setIsSidebarOn] = useState(window.innerWidth <= 1024); //will come to effect when screen is smaller than <lg
  const { userState, userDispatch } = useContext(UserContext);
  const { isLoginViaRefresh } = useContext(IsLoginViaRefreshContext);
  const location = useLocation();
  const [urlHistory, urlHistoryError] = useUrlHistory();
  const { contacts, setContacts } = useContext(ContactsContext);
  const { notifs, notifsDispatch, notifUnseen, setNotifUnseen } =
    useContext(NotifContext);
  const { pathname } = useLocation();

  useEffect(() => {
    urlHistoryError && console.log(urlHistoryError, "history error");
  }, [urlHistoryError]);

  // join the chat-tab room when the url contains /chats
  useEffect(() => {
    const isPathValid = /\/chats/.test(pathname);

    isPathValid
      ? socket.emit("join-room", "chats")
      : socket.emit("leave-room", "chats");
  }, [location]);

  // authorize user with socket.io, if the userState is not empty
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      if (Object.keys(userState.user).length !== 0 && isLoginViaRefresh) {
        socket.emit(
          "login",
          { userId: userState.user._id, token },
          (success, message) => !success && alert(message)
        );
      }
    }

    return () => socket.off("login");
  }, []);

  //update the notifs context when receiving a contact request
  useEffect(() => {
    receiveSendAddContact({
      notifs,
      notifsDispatch,
      notifUnseen,
      setNotifUnseen,
      notifActions: NOTIF_CONTEXT_ACTIONS,
    });

    return () => socket.off("receive-send-add-contact");
  }, [notifs, notifUnseen]);

  // when a contact request is cancelled
  useEffect(() => {
    receiveCancelAddContact({
      notifs,
      notifsDispatch,
      notifUnseen,
      setNotifUnseen,
      notifActions: NOTIF_CONTEXT_ACTIONS,
      userState,
    });

    return () => socket.off("receive-cancel-add-contact");
  }, [userState, notifs, notifUnseen]);

  // update sender data when the recipient accepts or rejects a contact request
  useEffect(() => {
    receiveContactRequestResponse({
      contacts,
      setContacts,
      notifs,
      notifsDispatch,
      notifActions: NOTIF_CONTEXT_ACTIONS,
      token: sessionStorage.getItem("token"),
      userState,
    });

    return () => socket.off("receive-contact-request-response");
  }, [userState, contacts, notifs]);

  // refresh userState
  useEffect(() => {
    socket.off("update-client-data");

    socket.on("update-client-data", (newData) => {
      if (newData.success) {
        const { user, token } = newData;

        userDispatch({ type: USER_ACTIONS.updateSuccess, payload: user });
        sessionStorage.setItem("token", token);
      } else {
        console.log(newData.message);
      }
    });

    return () => socket.off("update-client-data");
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
    socket.on("error", (err) => console.log(err));

    return () => socket.off("error");
  }, []);

  return (
    <>
      <SidebarContext.Provider value={{ isSidebarOn, setIsSidebarOn }}>
        <UrlHistoryContext.Provider value={urlHistory}>
          <div className="min-h-screen max-w-screen-2xl shadow-xl mx-auto">
            <MiniModal />
            <Modal />
            <InitialLoadingScreen />
            <div
              className={`flex duration-200
                       ${
                         modalState.isActive
                           ? //  lg:blur-sm
                             ""
                           : ""
                       }
                        `}
            >
              <ChatboxContextProvider>
                <Sidebar urlHistory={urlHistory} />
                <ChatBox activeChat={activeChat} />
              </ChatboxContextProvider>
            </div>
          </div>
        </UrlHistoryContext.Provider>
      </SidebarContext.Provider>
    </>
  );
}
