import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import RenderIf from "../../utils/React/RenderIf";
import { StartScreen } from "../StartScreen/StartScreen";
import socket from "../../utils/socketClient/socketClient";
import { useContext } from "react";
import { UserContext } from "../../context/user/userContext";
import getUsersPreview from "../../utils/apis/getusersPreview";
import {
  ActiveChatContext,
  ACTIVE_PRIVATE_CHAT_DEFAULT,
} from "../../context/activeChat/ActiveChatContext";
import {
  incrementMsgUnread,
  MessageLogsContext,
  pushNewEntry,
  pushNewMsgToEntry,
  removeMsgUnread,
} from "../../context/messageLogs/MessageLogsContext";
import MESSAGE_LOGS_ACTIONS from "../../context/messageLogs/messageLogsActions";
import throttle from "../../utils/performance/throttle";
import getScrollPercentage, {
  isWindowScrollable,
} from "../../utils/scroll/getScrollPercentage";
import { BsArrowLeftShort } from "react-icons/bs";
import newMsgSfx from "../../audio/newMsgSfx.mp3";
import { playAudio } from "../../utils/AudioPlayer/audioPlayer";
import { SidebarContext } from "../../pages/Home/Home";
import { SettingsContext } from "../../context/settingsContext/SettingsContext";
import { ContactsContext } from "../../context/contactContext/ContactContext";
import InputBar from "./components/InputBar/InputBar";
import Log from "./components/Log/Log";
import scrollToBottom from "../../utils/scroll/scrollToBottom";
import { cloneDeep } from "lodash";

export const ChatBox = () => {
  const newMsgSound = new Audio(newMsgSfx);
  const { activeChat, setActiveChat } = useContext(ActiveChatContext);
  const { msgLogs, msgLogsDispatch, msgUnread, setMsgUnread } =
    useContext(MessageLogsContext);
  const { userState } = useContext(UserContext);
  const { isSidebarOn, setIsSidebarOn } = useContext(SidebarContext);
  const location = useLocation();
  const [willGoToBottom, setWillGoToBottom] = useState(false);
  const messageLogRef = useRef();
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const { contacts } = useContext(ContactsContext);

  // INITIAL LOADING USE EFFECT
  useEffect(() => {
    const incompleteChatLog = msgLogs.content[activeChat._id];

    if (incompleteChatLog) {
      // check if the chat history has already been downloaded
      if (!incompleteChatLog.preview) return;

      const token = sessionStorage.getItem("token");
      const { chatId } = incompleteChatLog;

      try {
        socket.emit("download-a-chat-history", {
          token,
          pcIds: [chatId],
          gcIds: [],
        });
      } catch (error) {
        console.error(
          "🚀 ~ file: ChatBox.jsx ~ line 56 ~ getChatData ~ error",
          error
        );
      }
    }
  }, [msgLogs, activeChat]); //tell the server to download the chat log
  useEffect(() => {
    socket.on("a-chat-history-downloaded", (data) => {
      const updatedMsgLogs = cloneDeep(msgLogs.content);
      const { privateChats, groupChats } = data;
      const { user, chat, type } = privateChats[0];
      const targetChatLog = updatedMsgLogs[user];
      if (targetChatLog) {
        targetChatLog.type = type;
        targetChatLog.chat = chat;
        targetChatLog.preview = false;
      }

      msgLogsDispatch({
        type: MESSAGE_LOGS_ACTIONS.loaded,
        payload: updatedMsgLogs,
      });
    });

    return () => socket.off("a-chat-history-downloaded");
  }, [msgLogs]); //recieve the downloaded chat log
  useEffect(() => {
    if (location.pathname === "/chats") {
      const search = Object.fromEntries(
        location.search
          .slice(1, location.search.length)
          .split("&")
          .map((q) => q.split("="))
      );

      // check if the url provided id and type of chat
      if (search.id && search.type) {
        const updateActiveChat = (data, lastMsg) => {
          const newActiveChat = {
            _id: data._id,
            initials: data.initials,
            lastMsg: lastMsg || null,
            profilePicture: data.profilePicture,
            username: data.username,
          };

          setActiveChat(newActiveChat);
          if (window.innerWidth <= 1024) setIsSidebarOn(false);
        };

        // search existing user data in chatlogs for handling the active chat
        const userInMsgLog = cloneDeep(msgLogs.content[search.id]);
        if (userInMsgLog) {
          const lastMsg = userInMsgLog.chat[userInMsgLog.chat.length - 1];
          return updateActiveChat(userInMsgLog.user, lastMsg);
        }

        // search existing user data in contacts for handling the active chat
        const targetInContact = contacts.find(({ user }) => {
          return user._id === search.id;
        });
        if (targetInContact) {
          return updateActiveChat(targetInContact.user, null);
        }

        // get user data from the server for handling the active chat
        switch (search.type) {
          // execute different code according to the search type
          case "user":
            // fetch the initials, profile picture, and username from the server
            getUsersPreview(sessionStorage.getItem("token"), [search.id])
              .then(([userPreview]) => updateActiveChat(userPreview))
              .catch((err) => console.log(err));

            break;

          case "group":
            break;

          default:
            break;
        }
      } else {
        setActiveChat(ACTIVE_PRIVATE_CHAT_DEFAULT);
      }
    }
  }, [location, msgLogs]); // to check if the url is directed to a certain chat
  // END OF INITIAL LOADING USE EFFECT

  useEffect(() => {
    if (!messageLogRef.current) return;

    scrollToBottom(messageLogRef.current);
  }, [activeChat, messageLogRef]); // will go to the bottom of the screen when active chat changes

  useEffect(() => setWillGoToBottom(isWindowScrollable()), [activeChat]); // see if window is scrollable when active user is changed

  useEffect(() => {
    // check if the page is atleast scrolled by 70%
    const scrollCb = throttle(() => {
      const scrollPercent = getScrollPercentage();

      setWillGoToBottom(scrollPercent > 70 ? true : false);
    }, 200);

    messageLogRef.current?.addEventListener("scroll", scrollCb);

    return () => messageLogRef.current?.removeEventListener("scroll", scrollCb);
  }, []); //automatically scroll down to the latest message

  useEffect(() => {
    socket.on("receive-msg", async (data) => {
      const { message, chatId, success } = data;
      const assembledMsg = { ...message, chatId };

      // update the message logs
      msgLogs.content[message.by]
        ? pushNewMsgToEntry({
            targetId: message.by,
            message: assembledMsg,
            dispatch: msgLogsDispatch,
            msgLogs,
          })
        : // if chat log doesn't exist for this user
          pushNewEntry({
            msgLogs,
            targetId: message.by,
            message: assembledMsg,
            token: sessionStorage.getItem("token"),
            dispatch: msgLogsDispatch,
          });

      // update the unread message notif
      incrementMsgUnread({ msgUnread, setMsgUnread, chatId });

      // update the active chat last message so that when receiver see it, the message can be flag as read
      setActiveChat({ ...activeChat, lastMessage: message });

      // play notification audio when receiving a message
      playAudio(newMsgSound);

      // read msg if current active chat is the same user that sent the message
      if (willGoToBottom) scrollToBottom(messageLogRef.current);
    });

    return () => socket.off("receive-msg");
  }, [msgLogs, userState, activeChat]); // receiving message for recipient only code

  useEffect(() => {
    if (!activeChat._id) return;
    if (!msgLogs) return;
    if (!msgLogs?.content) return;
    if (!msgLogs?.content[activeChat._id]) return;
    if (!msgLogs?.content[activeChat._id]?.chatId) return;
    if (activeChat.lastMessage?.by === userState.user._id) return;

    const updatedMsgLogs = cloneDeep(msgLogs);
    const { chat, chatId } = updatedMsgLogs.content[activeChat._id];
    const time = new Date().toISOString();

    if (chat.length > 0) {
      const finalMesIndex = chat.length - 1;

      // only execute if the last message is not sent by this user
      if (chat[finalMesIndex].by !== userState.user._id) {
        const token = sessionStorage.getItem("token");

        if (chat[finalMesIndex].readAt === null) {
          // update local message read status
          const chatIdxLen = chat.length - 1;
          if (chatIdxLen > 0) {
            for (let i = chatIdxLen; i > 0; i--) {
              if (chat[i].readAt !== null) break;
              chat[i].readAt = time;
            }
          } else {
            chat[chatIdxLen].readAt = time;
          }

          msgLogsDispatch({
            type: MESSAGE_LOGS_ACTIONS.updateLoaded,
            payload: updatedMsgLogs.content,
          });

          // updated the msgUnread notifs
          removeMsgUnread({ msgUnread, setMsgUnread, chatId });

          // update the message read status to the server
          socket.emit("read-msg", time, token, activeChat._id, chatId);
          scrollToBottom(messageLogRef.current);
        }
      }
    }
  }, [activeChat, msgLogs]); //set the message to read

  useEffect(() => {
    socket.on("msg-on-read", (isRead, recipientId, time) => {
      if (isRead) {
        if (!msgLogs.content[recipientId]) return;
        if (!msgLogs.content[activeChat._id]) return;

        msgLogsDispatch({ type: MESSAGE_LOGS_ACTIONS.startUpdate });
        const updatedMsgLogs = cloneDeep(msgLogs);
        const { chat } = updatedMsgLogs.content[activeChat._id];

        // set the readAt time for messages
        for (let i = chat.length - 1; i >= 0; i--) {
          // it will break when the loop encounters a message that has been read
          if (chat[i].readAt !== null) break;

          chat[i].readAt = time;
        }

        msgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.updateLoaded,
          payload: updatedMsgLogs.content,
        });

        setTimeout(() => scrollToBottom(messageLogRef.current), 250);
      }
    });

    return () => socket.off("msg-on-read");
  }, [msgLogs, activeChat]); //msg onread

  useEffect(() => {
    socket.on("msg-sent", ({ success, message, chatId, timeSent }) => {
      if (!success) return;
      // console.log(chatId, success);

      // start the update sequence
      msgLogsDispatch({ type: MESSAGE_LOGS_ACTIONS.startUpdate });
      const updatedMsgLogs = cloneDeep(msgLogs);

      if (updatedMsgLogs.content[message.to]) {
        const chatContent = updatedMsgLogs.content[message.to].chat;

        // loop over the array of chats and find the one where the time sent matches, then update the isSent field into true
        const chatIdxLen = chatContent.length - 1;
        if (chatIdxLen > 0) {
          for (let i = chatIdxLen; i >= 0; i--) {
            if (chatContent[i].time === timeSent) {
              chatContent[i].isSent = true;
              break;
            }
          }
        } else {
          if (chatContent[chatIdxLen].time === timeSent) {
            chatContent[chatIdxLen].isSent = true;
          }
        }

        // fill the chat log id
        updatedMsgLogs.content[message.to].chatId = chatId;

        msgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.updateLoaded,
          payload: updatedMsgLogs.content,
        });

        // when finish sending message go straight to the bottom
        setTimeout(() => scrollToBottom(messageLogRef.current), 250);
      }
    });

    return () => socket.off("msg-sent");
  }, [msgLogs]); // for changing the message state indicator

  const handleGoToMenu = () => {
    setIsSidebarOn(!isSidebarOn);

    setTimeout(() => setActiveChat(ACTIVE_PRIVATE_CHAT_DEFAULT), 330);
  };

  return (
    <>
      <RenderIf conditionIs={!activeChat?.username}>
        <StartScreen handleGoToMenu={handleGoToMenu} />
      </RenderIf>
      <RenderIf conditionIs={activeChat?.username}>
        <main className="basis-full lg:basis-3/4 shadow-inner bg-gray-100 min-h-screen flex flex-col">
          <header className="h-14 bg-gray-50 shadow-inner py-2 px-2 lg:px-5 border-b-2">
            <div className="max-w-screen-sm lg:max-w-full mx-auto flex justify-between items-center">
              <div className="flex justify-between items-center  w-full">
                {/* sidebar btn (will show up when screen is <lg) */}
                <div className="flex items-center justify-between gap-2">
                  <Link
                    to="/chats"
                    onClick={handleGoToMenu}
                    className={`block lg:hidden hover:text-blue-400 text-3xl
                            ${general?.animation ? "duration-200" : ""}
                            `}
                  >
                    <BsArrowLeftShort />
                  </Link>
                  {/* profile  */}
                  <Link
                    to={`user/${activeChat?.username}`}
                    className="flex items-center gap-1"
                  >
                    <img
                      src="https://picsum.photos/200/200"
                      alt=""
                      className="rounded-full h-9 w-9"
                    />
                    <div className="flex flex-col items-start">
                      <span className="text-sm max-w-[200px] truncate">
                        {activeChat?.username}
                      </span>
                      <span className="text-xs text-gray-500 relative z-10 max-w-[200px] truncate">
                        Status
                      </span>
                    </div>
                  </Link>
                </div>

                {/* chat action buttons */}
                <div></div>
              </div>
            </div>
          </header>

          {/* message */}
          <main className="bg-gray-100 flex flex-col grow">
            <Log messageLogRef={messageLogRef} />
          </main>

          {/* input */}
          <footer className="sticky bottom-0 bg-gray-100">
            <InputBar messageLogRef={messageLogRef} />
          </footer>
        </main>
      </RenderIf>
    </>
  );
};
