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
import getScrollPercentage, {
  isWindowScrollable,
} from "../../utils/scroll/getScrollPercentage";
import newMsgSfx from "../../audio/newMsgSfx.mp3";
import { playAudio } from "../../utils/AudioPlayer/audioPlayer";
import { SidebarContext } from "../../pages/Home/Home";
import { ContactsContext } from "../../context/contactContext/ContactContext";
import InputBar from "./components/InputBar/InputBar";
import Log from "./components/Log/Log";
import scrollToBottom from "../../utils/scroll/scrollToBottom";
import _ from "lodash";
import ChatBoxHeader from "./components/ChatBoxHeader/ChatBoxHeader";
import lastIdx from "../../utils/others/lastIdx";
import { useCallback } from "react";

const userOnlineStatusSwitcher = (status) => {
  if (status === "online") {
    return { isOnline: true, lastSeen: null };
  } else {
    // check if the lastSeen time is valid
    return new Date(status).getMonth().toString() === NaN.toString()
      ? { isOnline: false, lastSeen: null }
      : { isOnline: false, lastSeen: status };
  }
};

export const ChatBox = () => {
  const newMsgSound = new Audio(newMsgSfx);
  const { activeChat, setActiveChat } = useContext(ActiveChatContext);
  const { msgLogs, msgLogsDispatch, msgUnread, setMsgUnread } =
    useContext(MessageLogsContext);
  const { userState } = useContext(UserContext);
  const { setIsSidebarOn } = useContext(SidebarContext);
  const location = useLocation();
  const [willGoToBottom, setWillGoToBottom] = useState(false);
  const messageLogRef = useRef();
  const { contacts } = useContext(ContactsContext);
  const invisibleWallRef = useRef();
  const [currStatus, setCurrStatus] = useState({
    isOnline: false,
    lastSeen: null,
    hasFetch: false,
  }); // for stopping infinite re render
  const checkWillGoToBottom = useCallback(
    _.throttle(() => {
      const scrollPercent = getScrollPercentage();

      setWillGoToBottom(scrollPercent > 70 ? true : false);
    }, 500),
    []
  ); // check if the page is atleast scrolled by 70%

  // check if the activeChat is online
  useEffect(() => {
    if (!activeChat?._id) return;

    const { isOnline, lastSeen } = activeChat;
    const { hasFetch, ...others } = currStatus;

    if (
      isOnline === others.isOnline &&
      lastSeen === others.lastSeen &&
      hasFetch
    ) {
      return;
    }

    socket.emit(
      "is-user-online",
      activeChat._id,
      sessionStorage.getItem("token")
    );
  }, [activeChat, currStatus]);

  // receive the online status from server
  useEffect(() => {
    socket.on("receive-is-user-online", (userId, status) => {
      if (userId !== activeChat._id) return;

      const newOnlineStatus = userOnlineStatusSwitcher(status);

      setActiveChat((prev) => ({ ...prev, ...newOnlineStatus }));
      setCurrStatus({ ...newOnlineStatus, hasFetch: true });
    });
    return () => socket.off("receive-is-user-online");
  }, [activeChat]);

  // refresh user online status
  useEffect(() => {
    socket.on("change-user-status", (userId, status) => {
      if (userId !== activeChat._id) return;

      const newOnlineStatus = userOnlineStatusSwitcher(status);

      setActiveChat((prev) => ({ ...prev, ...newOnlineStatus }));
      setCurrStatus({ ...newOnlineStatus, hasFetch: true });
    });

    return () => socket.off("change-user-status");
  }, [activeChat]);

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
  }, [activeChat, msgLogs]); //tell the server to download the chat log
  useEffect(() => {
    socket.on("a-chat-history-downloaded", (data) => {
      const { privateChats, groupChats } = data;
      const { user, chat, type } = privateChats[0];
      const newChatLogs = _.cloneDeep(msgLogs.content);

      // loop over the incoming message and group them based on time sent
      const result = {
        ...newChatLogs,
        [user]: { ...newChatLogs[user], chat, type, preview: false },
      };

      msgLogsDispatch({
        type: MESSAGE_LOGS_ACTIONS.loaded,
        payload: result,
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
        const updateActiveChat = (data, lastMessage) => {
          const newActiveChat = {
            _id: data._id,
            username: data.username,
            initials: data.initials,
            profilePicture: data.profilePicture,
            status: data.status,
            lastMessage: lastMessage || null,
            isOnline: false,
            lastSeen: null,
          };

          setActiveChat(newActiveChat);
          if (window.innerWidth <= 1024) setIsSidebarOn(false);
        };

        // search existing user data in chatlogs for handling the active chat
        const userInMsgLog = msgLogs.content[search.id];
        if (userInMsgLog) {
          const lastTimeGroup = userInMsgLog.chat[lastIdx(userInMsgLog.chat)];
          const lastMessage =
            lastTimeGroup.messages[lastIdx(lastTimeGroup.messages)];

          return updateActiveChat(userInMsgLog.user, lastMessage);
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
        if (window.innerWidth <= 1024) {
          setIsSidebarOn(true);
          setTimeout(() => {
            setActiveChat(ACTIVE_PRIVATE_CHAT_DEFAULT);
          }, 330);
        } else {
          setActiveChat(ACTIVE_PRIVATE_CHAT_DEFAULT);
        }
      }
    }
  }, [location]); // to check if the url is directed to a certain chat
  // END OF INITIAL LOADING USE EFFECT

  useEffect(() => {
    if (!messageLogRef.current) return;

    scrollToBottom(messageLogRef.current);
  }, [activeChat, messageLogRef]); // will go to the bottom of the screen when active chat changes

  useEffect(() => setWillGoToBottom(isWindowScrollable()), [activeChat]); // see if window is scrollable when active user is changed

  useEffect(() => {
    messageLogRef.current?.addEventListener("scroll", checkWillGoToBottom);

    return () =>
      messageLogRef.current?.removeEventListener("scroll", checkWillGoToBottom);
  }, [checkWillGoToBottom]); //automatically scroll down to the latest message

  useEffect(() => {
    socket.on("receive-msg", async (data) => {
      const { message, chatId, success } = data;
      const assembledMsg = { ...message, chatId };

      if (success) {
        // update the message logs
        msgLogs.content[message.by]
          ? pushNewMsgToEntry({
              targetId: message.by,
              message: assembledMsg,
              msgLogs,
              msgLogsDispatch,
            })
          : // if chat log doesn't exist for this user
            pushNewEntry({
              activeChat,
              targetId: message.by,
              message: assembledMsg,
              token: sessionStorage.getItem("token"),
              msgLogs,
              msgLogsDispatch,
            });

        // update the unread message notif
        incrementMsgUnread({ msgUnread, setMsgUnread, chatId });

        // update the active chat last message so that when receiver see it, the message can be flag as read
        setActiveChat({ ...activeChat, lastMessage: message });

        // play notification audio when receiving a message
        playAudio(newMsgSound);

        // read msg if current active chat is the same user that sent the message
        if (willGoToBottom) scrollToBottom(messageLogRef.current);
      }
    });

    return () => socket.off("receive-msg");
  }, [msgLogs, userState, activeChat]); // receiving message for recipient only code

  useEffect(() => {
    if (!activeChat?._id) return;
    if (!msgLogs?.content[activeChat._id]?.chatId) return;
    if (activeChat?.lastMessage?.by === userState?.user?._id) return;

    const updatedChatLogs = _.cloneDeep(msgLogs.content);
    const { chat: newChat } = updatedChatLogs[activeChat._id];
    const time = new Date().toISOString();
    const date = new Date().toLocaleDateString();

    if (newChat.length > 0) {
      const updatedTimeLogIdx = newChat.findIndex((m) => m.date === date);

      // if updatedTimeLogIdx is -1 it means there is no new message today
      if (updatedTimeLogIdx === -1) {
        scrollToBottom(messageLogRef.current);
      } else {
        const msgsInTimeLog = newChat[updatedTimeLogIdx].messages;
        const finalMesIndex = msgsInTimeLog.length - 1;
        const lastMsg = msgsInTimeLog[finalMesIndex];

        if (lastMsg.by !== userState.user._id) {
          if (lastMsg.readAt === null) {
            const { chatId } = msgLogs.content[activeChat._id];
            const token = sessionStorage.getItem("token");
            const msgsMaxLen = msgsInTimeLog.length - 1;
            const readMsgIds = [];

            if (msgsMaxLen > 0) {
              for (let i = msgsMaxLen; i > 0; i--) {
                if (msgsInTimeLog[i].readAt !== null) break;

                msgsInTimeLog[i].readAt = time;
                console.log(msgsInTimeLog[i]);
                readMsgIds.push(msgsInTimeLog[i]._id);
              }
            } else {
              msgsInTimeLog[0].readAt = time;
              readMsgIds.push(msgsInTimeLog[0]._id);
            }

            msgLogsDispatch({
              type: MESSAGE_LOGS_ACTIONS.updateLoaded,
              payload: updatedChatLogs,
            });

            // updated the msgUnread notifs
            removeMsgUnread({ msgUnread, setMsgUnread, chatId });

            console.log(readMsgIds);
            // update the message read status to the server
            socket.emit("read-msg", time, token, activeChat._id, readMsgIds);

            scrollToBottom(messageLogRef.current);
          }
        }
      }
    }
  }, [activeChat, msgLogs]); //set the message to read

  useEffect(() => {
    socket.on("msg-on-read", (isRead, recipientId, time) => {
      if (isRead) {
        if (!msgLogs.content[recipientId]) return;
        if (!msgLogs.content[activeChat._id]) return;

        /* NEW MSG LOGS*/
        const updatedChatLogs = _.cloneDeep(msgLogs.content);
        const { chat: newChat } = updatedChatLogs[activeChat._id];
        const date = new Date().toLocaleDateString();
        const updatedTimeLogIdx = newChat.findIndex((m) => m.date === date);
        const msgsInTimeLog = newChat[updatedTimeLogIdx].messages;
        const msgsMaxLen = msgsInTimeLog.length - 1;

        for (let i = msgsMaxLen; i > 0; i--) {
          if (msgsInTimeLog[i].readAt !== null) break;
          msgsInTimeLog[i].readAt = time;
        }

        msgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.updateLoaded,
          payload: updatedChatLogs,
        });
        setTimeout(() => scrollToBottom(messageLogRef.current), 250);
      }
    });

    return () => socket.off("msg-on-read");
  }, [msgLogs, activeChat]); //msg onread

  return (
    <>
      <RenderIf conditionIs={!activeChat?.username}>
        <StartScreen />
      </RenderIf>
      <RenderIf conditionIs={activeChat?.username}>
        <main className="relative basis-full lg:basis-3/4 shadow-inner bg-gray-100 min-h-screen flex flex-col">
          {/* invisible wall */}
          <div
            ref={invisibleWallRef}
            className="absolute inset-0 z-20 hidden"
          />

          <ChatBoxHeader invisibleWallRef={invisibleWallRef} />

          {/* message */}
          <Log messageLogRef={messageLogRef} />

          {/* input */}
          <InputBar messageLogRef={messageLogRef} />
        </main>
      </RenderIf>
    </>
  );
};
