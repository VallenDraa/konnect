import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RenderIf from "../../utils/React/RenderIf";
import { StartScreen } from "../StartScreen/StartScreen";
import socket from "../../utils/socketClient/socketClient";
import { useContext } from "react";
import { UserContext } from "../../context/user/userContext";
import getUsersPreview from "../../utils/apis/getusersPreview";
import {
  ActivePrivateChatContext,
  ACTIVE_PRIVATE_CHAT_DEFAULT,
} from "../../context/activePrivateChat/ActivePrivateChatContext";
import {
  incrementMsgUnread,
  MessageLogsContext,
  pushNewPrivateEntry,
  pushNewMsgToEntry,
  removeMsgUnread,
} from "../../context/messageLogs/MessageLogsContext";
import MESSAGE_LOGS_ACTIONS from "../../context/messageLogs/messageLogsActions";
import getScrollPercentage from "../../utils/scroll/getScrollPercentage";
import newMsgSfx from "../../audio/newMsgSfx.mp3";
import { playAudio } from "../../utils/AudioPlayer/audioPlayer";
import { CloseChatLogContext, SidebarContext } from "../../pages/Home/Home";
import { ContactsContext } from "../../context/contactContext/ContactContext";
import InputBar from "./components/InputBar/InputBar";
import Log from "./components/Log/Log";
import {
  scrollToBottom,
  scrollToBottomSmooth,
} from "../../utils/scroll/scrollToBottom";
import _ from "lodash";
import ChatBoxHeader from "./components/ChatBoxHeader/ChatBoxHeader";
import { SettingsContext } from "../../context/settingsContext/SettingsContext";
import { ActiveGroupChatContext } from "../../context/activeGroupChat/ActiveGroupChatContext";
import lastIdx from "../../utils/others/lastIdx";
import { CachedUserContext } from "../../context/cachedUser/CachedUserContext";

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
  const { fetchCachedUsers } = useContext(CachedUserContext);
  const { activePrivateChat, setActivePrivateChat } = useContext(
    ActivePrivateChatContext
  );
  const { activeGroupChat, setActiveGroupChat } = useContext(
    ActiveGroupChatContext
  );
  const { msgLogs, msgLogsDispatch, msgUnread, setMsgUnread } =
    useContext(MessageLogsContext);
  const { userState } = useContext(UserContext);
  const { setIsSidebarOn } = useContext(SidebarContext);
  const location = useLocation();
  const messageLogRef = useRef();
  const invisibleWallRef = useRef();
  const { contacts } = useContext(ContactsContext);
  const { settings } = useContext(SettingsContext);
  const { closeChatLog } = useContext(CloseChatLogContext);
  const { general } = settings;
  const navigate = useNavigate();
  const [currStatus, setCurrStatus] = useState({
    // for stopping infinite re render
    isOnline: false,
    lastSeen: null,
    hasFetch: false,
  });

  const updateActivePrivateChat = (data) => {
    const newActivePrivateChat = {
      _id: data._id,
      username: data.username,
      initials: data.initials,
      profilePicture: data.profilePicture,
      status: data.status,
      isOnline: false,
      lastSeen: null,
    };

    setActivePrivateChat(newActivePrivateChat);
    setActiveGroupChat(null);
    if (window.innerWidth <= 1024) setIsSidebarOn(false);
  };

  const updateActiveGroupChat = (chatId) => {
    setActivePrivateChat(ACTIVE_PRIVATE_CHAT_DEFAULT);
    setActiveGroupChat(chatId);

    if (window.innerWidth <= 1024) setIsSidebarOn(false);
  };

  useEffect(() => {
    const url = location.pathname + location.search;

    if (/^\/chats\?id=/.test(url) && /&type=/.test(url)) {
      const search = Object.fromEntries(
        location.search
          .slice(1, location.search.length)
          .split("&")
          .map((q) => q.split("="))
      );

      // check if the url provided id and type of chat
      if (!search.id && !search.type) return closeChatLog();

      switch (search.type) {
        case "private":
          if (msgLogs.isStarting) return;

          // get the user from cached data
          fetchCachedUsers(search.id)
            .then((userPreview) => updateActivePrivateChat(userPreview))
            .catch((err) => {
              closeChatLog();
              navigate("/chats");
            });
          break;
        case "group":
          if (msgLogs.isStarting) return;

          if (msgLogs.content[search.id]) {
            updateActiveGroupChat(search.id);
          } else {
            closeChatLog();
            navigate("/chats");
          }
          break;
        default:
          closeChatLog();
          navigate("/chats");
          break;
      }
    }
  }, [location, msgLogs]); // to check if the url is directed to a certain chat

  useEffect(() => {
    if (!activePrivateChat?._id) return;

    const { isOnline, lastSeen } = activePrivateChat;
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
      activePrivateChat._id,
      sessionStorage.getItem("token")
    );
  }, [activePrivateChat, currStatus]); // check if the activePrivateChat is online

  useEffect(() => {
    socket.on("receive-is-user-online", (userId, status) => {
      if (userId !== activePrivateChat._id) return;

      const newOnlineStatus = userOnlineStatusSwitcher(status);

      setActivePrivateChat((prev) => ({ ...prev, ...newOnlineStatus }));
      setCurrStatus({ ...newOnlineStatus, hasFetch: true });
    });
    return () => socket.off("receive-is-user-online");
  }, [activePrivateChat]); // receive the online status from server

  useEffect(() => {
    socket.on("change-user-status", (userId, status) => {
      if (userId !== activePrivateChat._id) return;

      const newOnlineStatus = userOnlineStatusSwitcher(status);

      setActivePrivateChat((prev) => ({ ...prev, ...newOnlineStatus }));
      setCurrStatus({ ...newOnlineStatus, hasFetch: true });
    });

    return () => socket.off("change-user-status");
  }, [activePrivateChat]); // refresh user online status

  useEffect(() => {
    const incompleteChatLog =
      msgLogs.content[activePrivateChat._id || activeGroupChat];

    if (incompleteChatLog) {
      // check if the chat history has already been downloaded
      if (!incompleteChatLog.preview) return;

      const token = sessionStorage.getItem("token");
      const { chatId } = incompleteChatLog;
      const ids = { pcIds: [], gcIds: [] };

      // push the preview chat id to the correct array
      ids[activeGroupChat ? "gcIds" : "pcIds"].push(chatId);

      socket.emit("download-a-chat-history", { token, ...ids });
    }
  }, [activePrivateChat, activeGroupChat, msgLogs]); //tell the server to download the chat history based on the active chat
  useEffect(() => {
    let downloaded = false;

    socket.on("a-chat-history-downloaded", (data) => {
      const { privateChats, groupChats } = data;
      const newChatLogs = _.cloneDeep(msgLogs.content);
      let result;

      if (privateChats.length > 0) {
        const { user, chat, type } = privateChats[0];

        // loop over the incoming message and group them based on time sent
        result = {
          ...newChatLogs,
          [user]: { ...newChatLogs[user], chat, type, preview: false },
        };
      }

      if (groupChats.length > 0) {
        const { chat, type, _id } = groupChats[0];

        result = {
          ...newChatLogs,
          [_id]: { ...newChatLogs[_id], chat, type, preview: false },
        };
      }

      msgLogsDispatch({
        type: MESSAGE_LOGS_ACTIONS.loaded,
        payload: result,
      });

      downloaded = true;
    });

    return () => {
      if (messageLogRef.current && downloaded) {
        scrollToBottom(messageLogRef.current);
      }
      socket.off("a-chat-log-downloaded");
    };
  }, [messageLogRef, msgLogs]); //receive the downloaded active chat histury

  useEffect(() => {
    socket.on("receive-get-a-full-chat", ({ groupChat, privateChat }) => {
      const newChatLogs = _.cloneDeep(msgLogs.content);

      if (groupChat) {
        newChatLogs[groupChat._id] = {
          name: groupChat.name,
          profilePicture: groupChat.profilePicture,
          chat: groupChat.chat,
          admins: groupChat.admins,
          members: groupChat.members,
          hasQuit: groupChat.hasQuit,
          invited: groupChat.invited,
          type: groupChat.type,
          chatId: groupChat._id,
          description: groupChat.description,
          preview: groupChat.preview,
          createdAt: groupChat.createdAt,
        };
      }
      if (privateChat) {
        newChatLogs[privateChat._id] = {
          chat: privateChat.chat,
          user: privateChat.user,
          type: privateChat.type,
          chatId: privateChat.chatId,
          preview: privateChat.preview,
        };
      }

      msgLogsDispatch({
        type: MESSAGE_LOGS_ACTIONS.updateLoaded,
        payload: newChatLogs,
      });
    });
  }, [msgLogs.content]); //get the full chat when the user accpeted a group invitation

  useEffect(() => {
    if (activePrivateChat._id !== null) scrollToBottom(messageLogRef.current);
  }, [activePrivateChat, messageLogRef]); //scroll to bottom when active chat changes

  useEffect(() => {
    socket.on("msg-sent", ({ success, to, msgId, timeSent, chatId }) => {
      if (!success) return;
      /* NEW MSG LOGS*/

      const updatedChatLogs = _.cloneDeep(msgLogs.content);
      const updateLogId = activePrivateChat._id || activeGroupChat;

      if (updatedChatLogs[to || chatId]) {
        const { chat: newChat } = updatedChatLogs[updateLogId];
        const date = new Date().toLocaleDateString();
        const updatedTimeLogIdx = newChat.findIndex((m) => m.date === date);
        const msgsInTimeLog = newChat[updatedTimeLogIdx].messages;
        const msgsMaxLen = msgsInTimeLog.length - 1;

        if (msgsMaxLen > 0) {
          for (let i = msgsMaxLen; i > 0; i--) {
            if (msgsInTimeLog[i].time !== timeSent) continue;

            msgsInTimeLog[i].isSent = true;
            msgsInTimeLog[i]._id = msgId;
            break;
          }
        } else {
          if (msgsInTimeLog[msgsMaxLen].time === timeSent) {
            msgsInTimeLog[msgsMaxLen].isSent = true;
            msgsInTimeLog[msgsMaxLen]._id = msgId;
          }
        }

        updatedChatLogs[updateLogId].chatId = chatId;
        msgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.updateLoaded,
          payload: updatedChatLogs,
        });
      }
    });

    return () => socket.off("msg-sent");
  }, [msgLogs]); // for changing the message state indicator

  useEffect(() => {
    socket.on("receive-msg", async (data) => {
      const { message, chatId, success, chatType } = data;
      const targetId = chatType === "private" ? message.by : chatId;

      if (success) {
        // update the message logs
        msgLogs.content[targetId]
          ? pushNewMsgToEntry({
              targetId,
              message,
              msgLogs,
              msgLogsDispatch,
            })
          : // if chat log doesn't exist for this user
            pushNewPrivateEntry({
              type: chatType,
              targetId,
              message,
              token: sessionStorage.getItem("token"),
              msgLogs,
              msgLogsDispatch,
              chatId,
            });

        // update the unread message notif
        incrementMsgUnread({
          msgUnread,
          setMsgUnread,
          chatId: targetId,
        });

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
  }, [msgLogs, userState, msgUnread]); // receiving message for recipient only code

  useEffect(() => {
    if (!activePrivateChat?._id) return;
    if (!msgLogs?.content[activePrivateChat?._id]?.chat) return;

    // check if there is at least one message in the chat log & if the last message is by the other user
    const lastTimeLog = _.last(msgLogs.content[activePrivateChat._id].chat);
    const lastMsg = _.last(lastTimeLog.messages);

    if (lastMsg?.by === userState?.user?._id) return;

    const updatedChatLogs = _.cloneDeep(msgLogs.content);
    const time = new Date().toISOString();
    const { chat: newChat } = updatedChatLogs[activePrivateChat._id];

    if (newChat.length > 0) {
      const maxTimeLogsIdx = lastIdx(newChat);
      const readMsgIds = [];
      const token = sessionStorage.getItem("token");

      for (let i = maxTimeLogsIdx; i >= 0; i--) {
        const msgsInTimeLog = newChat[i].messages;
        const lastMsg = _.last(msgsInTimeLog);

        if (lastMsg.by !== userState.user._id) {
          const msgsMaxLen = msgsInTimeLog.length - 1;
          if (lastMsg?.readAt !== null) break;

          if (msgsMaxLen > 0) {
            for (let j = msgsMaxLen; j > 0; j--) {
              if (msgsInTimeLog[j]?.readAt !== null) break;

              msgsInTimeLog[j].readAt = time;

              readMsgIds.push(msgsInTimeLog[j]._id);
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
          removeMsgUnread({
            msgUnread,
            setMsgUnread,
            chatId: activePrivateChat._id,
          });

          // update the message read status to the server
          socket.emit(
            "private-read-msg",
            time,
            token,
            activePrivateChat._id,
            readMsgIds
          );
        }
      }
    }
  }, [activePrivateChat, msgLogs]); //set the message to read for private chat
  useEffect(() => {
    socket.on("private-msg-on-read", (isRead, recipientId, time) => {
      if (isRead) {
        if (!msgLogs.content[recipientId]) return;
        if (!msgLogs.content[activePrivateChat._id]) return;

        /* NEW MSG LOGS*/
        const updatedChatLogs = _.cloneDeep(msgLogs.content);
        const { chat: newChat } = updatedChatLogs[activePrivateChat._id];
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

    return () => socket.off("private-msg-on-read");
  }, [msgLogs, activePrivateChat]); //private msg onread

  useEffect(() => {
    if (!activeGroupChat) return;
    if (!msgLogs.content[activeGroupChat]) return;

    const token = sessionStorage.getItem("token");
    const userId = userState?.user?._id;
    const updatedChatLogs = _.cloneDeep(msgLogs.content);
    const time = new Date().toISOString();
    const { chat: newChat, admins, members } = updatedChatLogs[activeGroupChat];
    const membersLen = admins.length + members.length;
    const readMsgIds = [];
    const lastMsg = _.last(_.last(newChat).messages);

    // check if the last message has been read by the user if so it means the previous messages had also been read
    if (!lastMsg._id) return;
    if (lastMsg.by === userState.user._id) return;
    if (lastMsg.beenReadBy?.length - 1 === membersLen) return;
    if (lastMsg.beenReadBy?.some((u) => u.user === userId)) return;

    // loop through the time group
    for (let i = newChat.length - 1; i >= 0; i--) {
      // loop through the messages in the time group
      const msgs = newChat[i].messages;
      const msgHasBeenRead = msgs[msgs.length - 1].beenReadBy.some(
        (u) => u.user === userId
      );

      if (msgHasBeenRead) break;

      for (let j = msgs.length - 1; j >= 0; j--) {
        // check if the messages read list can be updated
        if (msgs[j].msgType === "notice") continue;
        if (msgs[j].beenReadBy.some((u) => u.user === userId)) break;
        if (msgs[j].beenReadBy.length - 1 === membersLen) return;
        if (msgs[j].beenReadBy.length === membersLen) break;

        // add the current user to the read list
        msgs[j].beenReadBy.push({ user: userId, readAt: time });

        // push the current msg id to be updated in the server
        readMsgIds.push(msgs[j]._id);
      }
    }

    if (readMsgIds.length > 0) {
      msgLogsDispatch({
        type: MESSAGE_LOGS_ACTIONS.updateLoaded,
        payload: updatedChatLogs,
      });
      // updated the msgUnread notifs
      removeMsgUnread({
        msgUnread,
        setMsgUnread,
        chatId: activeGroupChat,
      });
      // update the message read status to the server
      socket.emit(
        "group-read-msg",
        time,
        token,
        activeGroupChat,
        userId,
        readMsgIds
      );
    }
  }, [activeGroupChat, msgLogs]); //set the message to read for group chat

  return (
    <>
      <RenderIf conditionIs={!activePrivateChat?._id && !activeGroupChat}>
        <StartScreen />
      </RenderIf>
      <RenderIf conditionIs={activePrivateChat?._id || activeGroupChat}>
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

// WIP group message read status
// useEffect(() => {
//   socket.on("group-msg-on-read", (isRead, groupId, userId, time) => {
//     if (isRead) {
//       if (!msgLogs.content[groupId]) return;
//       // if (!msgLogs.content[activeGroupChat]) return;

//       // console.log(userId, userState.user._id);
//       /* NEW MSG LOGS*/
//       const updatedChatLogs = _.cloneDeep(msgLogs.content);
//       const { chat: newChat } = updatedChatLogs[groupId];
//       const date = new Date().toLocaleDateString();
//       const updatedTimeLogIdx = newChat.findIndex((m) => m.date === date);
//       const msgsInTimeLog = newChat[updatedTimeLogIdx].messages;
//       const msgsMaxLen = msgsInTimeLog.length - 1;

//       if (msgsMaxLen > 0) {
//         for (let i = msgsMaxLen; i > 0; i--) {
//           if (msgsInTimeLog[i]?.beenReadBy?.some((i) => i.user === userId)) {
//             break;
//           }

//           msgsInTimeLog[i].beenReadBy.push({ user: userId, readAt: time });
//         }
//       } else {
//         msgsInTimeLog[0].beenReadBy.push({ user: userId, readAt: time });
//       }

//       msgLogsDispatch({
//         type: MESSAGE_LOGS_ACTIONS.updateLoaded,
//         payload: updatedChatLogs,
//       });
//     }
//   });

//   return () => socket.off("group-msg-on-read");
// }, [msgLogs]); //group msg onread
