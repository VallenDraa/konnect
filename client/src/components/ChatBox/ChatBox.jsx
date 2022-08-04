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
import getScrollPercentage from "../../utils/scroll/getScrollPercentage";
import newMsgSfx from "../../audio/newMsgSfx.mp3";
import { playAudio } from "../../utils/AudioPlayer/audioPlayer";
import { SidebarContext } from "../../pages/Home/Home";
import { ContactsContext } from "../../context/contactContext/ContactContext";
import InputBar from "./components/InputBar/InputBar";
import Log from "./components/Log/Log";
import {
  scrollToBottom,
  scrollToBottomSmooth,
} from "../../utils/scroll/scrollToBottom";
import _ from "lodash";
import ChatBoxHeader from "./components/ChatBoxHeader/ChatBoxHeader";
import lastIdx from "../../utils/others/lastIdx";
import { SettingsContext } from "../../context/settingsContext/SettingsContext";

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
  const messageLogRef = useRef();
  const { contacts } = useContext(ContactsContext);
  const invisibleWallRef = useRef();
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const [currStatus, setCurrStatus] = useState({
    isOnline: false,
    lastSeen: null,
    hasFetch: false,
  }); // for stopping infinite re render

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
  }, [activeChat, currStatus]); // check if the activeChat is online

  useEffect(() => {
    socket.on("receive-is-user-online", (userId, status) => {
      if (userId !== activeChat._id) return;

      const newOnlineStatus = userOnlineStatusSwitcher(status);

      setActiveChat((prev) => ({ ...prev, ...newOnlineStatus }));
      setCurrStatus({ ...newOnlineStatus, hasFetch: true });
    });
    return () => socket.off("receive-is-user-online");
  }, [activeChat]); // receive the online status from server

  useEffect(() => {
    socket.on("change-user-status", (userId, status) => {
      if (userId !== activeChat._id) return;

      const newOnlineStatus = userOnlineStatusSwitcher(status);

      setActiveChat((prev) => ({ ...prev, ...newOnlineStatus }));
      setCurrStatus({ ...newOnlineStatus, hasFetch: true });
    });

    return () => socket.off("change-user-status");
  }, [activeChat]); // refresh user online status

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

      if (messageLogRef.current) scrollToBottom(messageLogRef.current);
    });

    return () => socket.off("a-chat-history-downloaded");
  }, [messageLogRef, msgLogs]); //receive the downloaded chat log
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
        const updateActiveChat = (data) => {
          const newActiveChat = {
            _id: data._id,
            username: data.username,
            initials: data.initials,
            profilePicture: data.profilePicture,
            status: data.status,
            isOnline: false,
            lastSeen: null,
          };

          setActiveChat(newActiveChat);
          if (window.innerWidth <= 1024) setIsSidebarOn(false);
        };

        // search existing user data in chatlogs for handling the active chat
        const userInMsgLog = msgLogs.content[search.id];
        if (userInMsgLog) {
          return updateActiveChat(userInMsgLog.user);
        }

        // search existing user data in contacts for handling the active chat
        const targetInContact = contacts.find(
          ({ user }) => user._id === search.id
        );
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
          setTimeout(() => setActiveChat(ACTIVE_PRIVATE_CHAT_DEFAULT), 400);
        } else {
          setActiveChat(ACTIVE_PRIVATE_CHAT_DEFAULT);
        }
      }
    }
  }, [location]); // to check if the url is directed to a certain chat

  useEffect(() => {
    if (activeChat._id !== null) scrollToBottom(messageLogRef.current);
  }, [activeChat, messageLogRef]); //scroll to bottom when active chat changes

  useEffect(() => {
    socket.on("receive-msg", async (data) => {
      const { message, chatId, success } = data;
      if (success) {
        // update the message logs
        msgLogs.content[message.by]
          ? pushNewMsgToEntry({
              targetId: message.by,
              message,
              msgLogs,
              msgLogsDispatch,
            })
          : // if chat log doesn't exist for this user
            pushNewEntry({
              activeChat,
              targetId: message.by,
              message,
              token: sessionStorage.getItem("token"),
              msgLogs,
              msgLogsDispatch,
              chatId,
            });

        // update the unread message notif
        incrementMsgUnread({ msgUnread, setMsgUnread, chatId });

        // play notification audio when receiving a message
        playAudio(newMsgSound);

        // scroll to the bottom of the screen if user is in chat mode
        if (messageLogRef.current) {
          if (getScrollPercentage(messageLogRef.current) > 70) {
            setTimeout(() => {
              general.animation
                ? scrollToBottomSmooth(messageLogRef.current)
                : scrollToBottom(messageLogRef.current);
            }, 100);
          }
        }
      }
    });

    return () => socket.off("receive-msg");
  }, [msgLogs, userState, activeChat]); // receiving message for recipient only code

  useEffect(() => {
    if (!activeChat?._id) return;
    if (!msgLogs?.content[activeChat._id]?.chatId) return;
    if (!msgLogs?.content[activeChat._id]?.chat) return;

    // check if there is at least one message in the chat log
    const lastMsgIdx = lastIdx(msgLogs.content[activeChat._id].chat);
    if (lastMsgIdx === -1) return;

    // check if the last message is by the other user
    const lastMsg = msgLogs.content[activeChat._id].chat[lastMsgIdx];
    if (lastMsg?.by === userState?.user?._id) return;

    const updatedChatLogs = _.cloneDeep(msgLogs.content);
    const { chat: newChat } = updatedChatLogs[activeChat._id];
    const time = new Date().toISOString();
    const date = new Date().toLocaleDateString();

    if (newChat.length > 0) {
      const updatedTimeLogIdx = newChat.findIndex((m) => m.date === date);

      // if updatedTimeLogIdx is -1 it means there is no new message today
      if (updatedTimeLogIdx !== -1) {
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

            // update the message read status to the server
            socket.emit("read-msg", time, token, activeChat._id, readMsgIds);
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

        if (msgsMaxLen > 0) {
          for (let i = msgsMaxLen; i > 0; i--) {
            if (msgsInTimeLog[i].readAt !== null) break;
            msgsInTimeLog[i].readAt = time;
          }
        } else {
          msgsInTimeLog[0].readAt = time;
        }

        msgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.updateLoaded,
          payload: updatedChatLogs,
        });
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
