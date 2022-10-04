import { createContext, useContext, useState } from "react";
import { Sidebar } from "../../components/Sidebar/Sidebar";
import { ChatBox } from "../../components/ChatBox/ChatBox";
import { Modal } from "../../components/modal/Modal";
import { InitialLoadingScreen } from "../../components/InitialLoadingScreen/InitialLoadingScreen";
import { ModalContext } from "../../context/modal/modalContext";
import { useEffect } from "react";
import { UserContext } from "../../context/user/userContext";
import {
  ActivePrivateChatContext,
  ACTIVE_PRIVATE_CHAT_DEFAULT,
} from "../../context/activePrivateChat/ActivePrivateChatContext";
import { IsLoginViaRefreshContext } from "../../context/isLoginViaRefresh/isLoginViaRefresh";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../../utils/socketClient/socketClient";
import USER_ACTIONS from "../../context/user/userAction";
import MODAL_ACTIONS from "../../context/modal/modalActions";
import locationForModal from "../../components/Modal/utils/locationForModal";
import MiniModal from "../../components/MiniModal/MiniModal";
import useUrlHistory from "../../utils/React/hooks/useUrlHistory/useUrlHistory";
import ChatboxContextProvider from "../../context/chatBoxState/chatBoxContext";
import { ContactsContext } from "../../context/contactContext/ContactContext";
import {
  NotifContext,
  receiveCancelAddContact,
  receiveContactRequestResponse,
  receiveSendAddContact,
} from "../../context/notifContext/NotifContext";
import NOTIF_CONTEXT_ACTIONS from "../../context/notifContext/notifContextActions";
import {
  ActiveGroupChatContext,
  makeNewGroup,
} from "../../context/activeGroupChat/ActiveGroupChatContext";
import { MessageLogsContext } from "../../context/messageLogs/MessageLogsContext";
import { SettingsContext } from "../../context/settingsContext/SettingsContext";

// url history context
export const UrlHistoryContext = createContext(null);
export const SidebarContext = createContext(null);
export const CloseChatLogContext = createContext(null);

export default function Home() {
  const { activePrivateChat, setActivePrivateChat } = useContext(
    ActivePrivateChatContext
  );
  const { activeGroupChat, setActiveGroupChat } = useContext(
    ActiveGroupChatContext
  );
  const { modalState, modalDispatch } = useContext(ModalContext);
  const [isSidebarOn, setIsSidebarOn] = useState(window.innerWidth <= 1024); //will come to effect when screen is smaller than <lg
  const { userState, userDispatch } = useContext(UserContext);
  const { isLoginViaRefresh } = useContext(IsLoginViaRefreshContext);
  const location = useLocation();
  const [urlHistory, urlHistoryError] = useUrlHistory();
  const { pathname } = useLocation();
  const { contacts, setContacts } = useContext(ContactsContext);
  const { notifs, notifsDispatch, notifUnseen, setNotifUnseen } =
    useContext(NotifContext);
  const { msgLogs, msgLogsDispatch } = useContext(MessageLogsContext);
  const navigate = useNavigate();
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  const closeChatLog = () => {
    const delay = window.innerWidth <= 1024 ? 400 : 0;

    if (window.innerWidth <= 1024) {
      if (!isSidebarOn) setIsSidebarOn(true);
    }

    setTimeout(() => {
      // disable active private chat if it is not empty
      if (activePrivateChat._id !== null) {
        setActivePrivateChat(ACTIVE_PRIVATE_CHAT_DEFAULT);
      }

      // disable active group chat if it is not empty
      if (activeGroupChat) setActiveGroupChat(null);
    }, delay);
  };

  useEffect(() => {
    urlHistoryError && console.log(urlHistoryError, "history error");
  }, [urlHistoryError]);

  useEffect(() => {
    socket.on(
      "receive-make-new-group",
      ({ success, chatId, name, users, newNotice, initiator, createdAt }) => {
        if (success) {
          makeNewGroup({
            chatId,
            name,
            users,
            createdAt,
            newNotice,
            msgLogs,
            msgLogsDispatch,
          });
          socket.emit("join-room", chatId);

          // redirect the page to the group chat if this user is the one that creates the group
          if (initiator) {
            // set the active group
            setActiveGroupChat(chatId);

            // deactive private chat
            setActivePrivateChat(ACTIVE_PRIVATE_CHAT_DEFAULT);
            navigate(`/chats?id=${chatId}&type=group`);
          }
        }
      }
    );

    return () => socket.off("receive-make-new-group");
  }, [msgLogs]); //make new group

  useEffect(() => {
    const isPathValid = /^\/chats/.test(pathname);

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
          (success, message) => {
            if (success) {
              const TOKEN_TIMER =
                JSON.parse(atob(sessionStorage.getItem("token").split(".")[1]))
                  .exp *
                  1000 -
                Date.now() -
                5000;

              // log user out and prompt them to log back in (TEMPORARY)
              setTimeout(() => {
                // deactivate chat
                setActivePrivateChat(ACTIVE_PRIVATE_CHAT_DEFAULT);
                setActiveGroupChat(null);

                // close the modal so that when a user logs back in, it doesn't jitter
                modalDispatch({ type: MODAL_ACTIONS.close });

                userDispatch({ type: USER_ACTIONS.logout });
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("refreshToken");
                navigate("/login");
                alert("Your Token Has Expired, Please Re-Login To Continue !");
              }, TOKEN_TIMER);
            } else {
              alert(message);
            }
          }
        );
      }
    }

    return () => socket.off("login");
  }, []);

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

  //update the notifs context when receiving a contact request
  useEffect(() => {
    if (!modalState.isActive) {
      receiveSendAddContact({
        notifs,
        notifsDispatch,
        notifUnseen,
        setNotifUnseen,
        notifActions: NOTIF_CONTEXT_ACTIONS,
      });

      return () => socket.off("receive-send-add-contact");
    }
  }, [notifs, notifUnseen, modalState]);

  // when a contact request is cancelled
  useEffect(() => {
    if (!modalState.isActive) {
      receiveCancelAddContact({
        notifs,
        notifsDispatch,
        notifUnseen,
        setNotifUnseen,
        notifActions: NOTIF_CONTEXT_ACTIONS,
        userState,
      });

      return () => socket.off("receive-cancel-add-contact");
    }
  }, [userState, notifs, notifUnseen, modalState]);

  // update sender data when the recipient accepts or rejects a contact request
  useEffect(() => {
    if (!modalState.isActive) {
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
    }
  }, [userState, contacts, notifs, modalState]);

  return (
    <>
      <SidebarContext.Provider value={{ isSidebarOn, setIsSidebarOn }}>
        <UrlHistoryContext.Provider value={urlHistory}>
          <div className={`min-h-screen max-w-screen-2xl shadow-xl mx-auto`}>
            <MiniModal />
            <Modal />
            <InitialLoadingScreen />
            <div
              className={`${
                general?.animation ? "animate-d-down-open" : ""
              } flex duration-200`}
            >
              <ChatboxContextProvider>
                <CloseChatLogContext.Provider value={{ closeChatLog }}>
                  <Sidebar urlHistory={urlHistory} />
                  <ChatBox activePrivateChat={activePrivateChat} />
                </CloseChatLogContext.Provider>
              </ChatboxContextProvider>
            </div>
          </div>
        </UrlHistoryContext.Provider>
      </SidebarContext.Provider>
    </>
  );
}
