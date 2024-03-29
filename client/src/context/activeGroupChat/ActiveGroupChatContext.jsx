import { useContext, createContext, useEffect, useState } from "react";
import { cloneDeep, last } from "lodash";
import MESSAGE_LOGS_ACTIONS from "../messageLogs/messageLogsActions";
import { TitleContext } from "../titleContext/TitleContext";
import { MessageLogsContext } from "../messageLogs/MessageLogsContext";
import socket from "../../utils/socketClient/socketClient";
import { UserContext } from "../user/userContext";
import USER_ACTIONS from "../user/userAction";
import MINI_MODAL_ACTIONS from "../miniModal/miniModalActions";
import { MiniModalContext } from "../miniModal/miniModalContext";
import { NotifContext } from "../notifContext/NotifContext";
import NOTIF_CONTEXT_ACTIONS from "../notifContext/notifContextActions";
import newNotifSfx from "../../audio/newNotifSfx.mp3";
import { playAudio } from "../../utils/AudioPlayer/audioPlayer";
const newNotifAudio = new Audio(newNotifSfx);
newNotifAudio.volume = 0.6;

export const ActiveGroupChatContext = createContext("");

export default function ActiveGroupChatContextProvider({ children }) {
  const [activeGroupChat, setActiveGroupChat] = useState("");
  const { msgLogs, msgLogsDispatch } = useContext(MessageLogsContext);
  const { setTitle } = useContext(TitleContext);
  const { userState, userDispatch } = useContext(UserContext);
  const { miniModalDispatch } = useContext(MiniModalContext);
  const { notifs, notifsDispatch } = useContext(NotifContext);

  // change the web title according to the user we are chatting to
  useEffect(() => {
    if (!msgLogs.content[activeGroupChat]) {
      setTitle((prev) => ({ ...prev, suffix: "" }));
    } else {
      const suffix = msgLogs.content[activeGroupChat].name
        ? ` - ${msgLogs.content[activeGroupChat].name}`
        : "";

      setTitle((prev) => ({ ...prev, suffix }));
    }
  }, [activeGroupChat, msgLogs.content]);

  // for receiving remove group from the message logs socket
  useEffect(() => {
    socket.on("receive-remove-group", ({ groupId }) => {
      const newMsgLogs = cloneDeep(msgLogs.content);
      delete newMsgLogs[groupId];

      msgLogsDispatch({
        type: MESSAGE_LOGS_ACTIONS.updateLoaded,
        payload: newMsgLogs,
      });
      miniModalDispatch({ type: MINI_MODAL_ACTIONS.closing });
      miniModalDispatch({ type: MINI_MODAL_ACTIONS.closed });
    });

    return () => socket.off("receive-remove-group");
  }, [msgLogs.content]);

  // for receiving group edits socket
  useEffect(() => {
    socket.on("receive-edit-group", (newGroupInfos) => {
      const { _id, newName, newDesc, newNotices } = newGroupInfos;

      // picking the group chat log and cloning it
      const newChatLogs = cloneDeep(msgLogs.content);

      // updating the group data
      newChatLogs[_id].name = newName;
      newChatLogs[_id].description = newDesc;

      // adding the new notice to the existing chat log
      const latestTimeGroup = last(newChatLogs[_id].chat);
      latestTimeGroup.date === newNotices.date
        ? latestTimeGroup.messages.push(...newNotices.messages)
        : newChatLogs[_id].chat.push(newNotices);

      msgLogsDispatch({
        type: MESSAGE_LOGS_ACTIONS.updateLoaded,
        payload: newChatLogs,
      });
    });

    return () => socket.off("receive-edit-group");
  }, [msgLogs.content]);

  // for receiving quitting group socket
  useEffect(() => {
    socket.on(
      "receive-quit-group",
      ({ groupId, userId, newNotices, isAdmin, exitDate, newAdmin }) => {
        // picking the group chat log and cloning it
        const newChatLogs = cloneDeep(msgLogs.content);
        const newUserData = cloneDeep(userState.user);

        // updating the group data
        if (isAdmin) {
          newChatLogs[groupId].admins = newChatLogs[groupId].admins.filter(
            (a) => a !== userId
          );
        } else {
          newChatLogs[groupId].members = newChatLogs[groupId].members.filter(
            (m) => m !== userId
          );
        }
        newChatLogs[groupId].hasQuit.push({ user: userId, date: exitDate });

        // shift the first member to be admin
        if (newAdmin) {
          newChatLogs[groupId].members = newChatLogs[groupId].members.filter(
            (m) => m !== newAdmin
          );

          newChatLogs[groupId].admins.push(newAdmin);
        }

        // update user data
        newUserData.hasQuitGroup.push({ group: groupId, date: exitDate });

        // adding the new notice to the existing chat log
        const latestTimeGroup = last(newChatLogs[groupId].chat);
        latestTimeGroup.date === newNotices.date
          ? latestTimeGroup.messages.push(...newNotices.messages)
          : newChatLogs[groupId].chat.push(newNotices);

        // saving the changes
        msgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.updateLoaded,
          payload: newChatLogs,
        });
        userDispatch({
          type: USER_ACTIONS.updateSuccess,
          payload: newUserData,
        });
      }
    );

    return () => socket.off("receive-quit-group");
  }, [msgLogs.content, userState.user]);

  // for receiving kicked from group socket
  useEffect(() => {
    socket.on(
      "receive-kick-from-group",
      ({ groupId, userId, newNotices, isAdmin, exitDate, newAdmin }) => {
        // picking the group chat log and cloning it
        const newChatLogs = cloneDeep(msgLogs.content);
        const newUserData = cloneDeep(userState.user);

        // updating the group data
        if (isAdmin) {
          newChatLogs[groupId].admins = newChatLogs[groupId].admins.filter(
            (a) => a !== userId
          );
        } else {
          newChatLogs[groupId].members = newChatLogs[groupId].members.filter(
            (m) => m !== userId
          );
        }
        newChatLogs[groupId].hasQuit.push({ user: userId, date: exitDate });

        // shift the first member to be admin
        if (newAdmin) {
          newChatLogs[groupId].members = newChatLogs[groupId].members.filter(
            (m) => m !== newAdmin
          );

          newChatLogs[groupId].admins.push(newAdmin);
        }

        // adding the new notice to the existing chat log
        const latestTimeGroup = last(newChatLogs[groupId].chat);
        latestTimeGroup.date === newNotices.date
          ? latestTimeGroup.messages.push(...newNotices.messages)
          : newChatLogs[groupId].chat.push(newNotices);

        // saving the changes
        msgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.updateLoaded,
          payload: newChatLogs,
        });

        // update user data
        newUserData.hasQuitGroup.push({ group: groupId, date: exitDate });
        userDispatch({
          type: USER_ACTIONS.updateSuccess,
          payload: newUserData,
        });

        // update the notifications
      }
    );

    return () => socket.off("receive-kick-from-group");
  }, [msgLogs.content, userState.user]);

  // for receiving give admin status
  useEffect(() => {
    socket.on("receive-give-admin-status", ({ newNotice, groupId, userId }) => {
      // picking the group chat log and cloning it
      const newChatLogs = cloneDeep(msgLogs.content);

      // updating the group participants data
      newChatLogs[groupId].members = newChatLogs[groupId].members.filter(
        (m) => m !== userId
      );
      newChatLogs[groupId].admins.push(userId);

      // adding the new notice to the existing chat log
      const latestTimeGroup = last(newChatLogs[groupId].chat);
      latestTimeGroup.date === newNotice.date
        ? latestTimeGroup.messages.push(...newNotice.messages)
        : newChatLogs[groupId].chat.push(newNotice);

      msgLogsDispatch({
        type: MESSAGE_LOGS_ACTIONS.updateLoaded,
        payload: newChatLogs,
      });
    });

    return () => socket.off("receive-give-admin-status");
  }, [msgLogs.content]);

  // for receiving revoke admin status
  useEffect(() => {
    socket.on(
      "receive-revoke-admin-status",
      ({ newNotice, groupId, userId }) => {
        // picking the group chat log and cloning it
        const newChatLogs = cloneDeep(msgLogs.content);

        // updating the group participants data
        newChatLogs[groupId].admins = newChatLogs[groupId].admins.filter(
          (m) => m !== userId
        );
        newChatLogs[groupId].members.push(userId);

        // adding the new notice to the existing chat log
        const latestTimeGroup = last(newChatLogs[groupId].chat);
        latestTimeGroup.date === newNotice.date
          ? latestTimeGroup.messages.push(...newNotice.messages)
          : newChatLogs[groupId].chat.push(newNotice);

        msgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.updateLoaded,
          payload: newChatLogs,
        });
      }
    );

    return () => socket.off("receive-revoke-admin-status");
  }, [msgLogs.content]);

  // for receiving group invites
  useEffect(() => {
    socket.on("receive-invite-to-group", ({ newNotice, notif, groupId }) => {
      // add the notification to the invited user
      if (notif) {
        const newNotifs = {
          ...notifs.content,
          inbox: notifs.content.inbox.map((ibx) => {
            if (ibx.type === "group_request") {
              return ibx.group._id === notif.group._id ? notif : ibx;
            } else {
              return ibx;
            }
          }),
        };
        notifsDispatch({
          type: NOTIF_CONTEXT_ACTIONS.loaded,
          payload: newNotifs,
        });

        playAudio(newNotifAudio);
      }

      // add the new notice message to the group
      if (newNotice) {
        const newChatLogs = cloneDeep(msgLogs.content);

        // adding the new notice to the existing chat log
        const latestTimeGroup = last(newChatLogs[groupId].chat);
        latestTimeGroup.date === newNotice.date
          ? latestTimeGroup.messages.push(...newNotice.messages)
          : newChatLogs[groupId].chat.push(newNotice);

        msgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.updateLoaded,
          payload: newChatLogs,
        });
      }
    });

    return () => socket.off("receive-invite-to-group");
  }, [msgLogs.content, userState.user, notifs.content]);

  // for receiving group invite acceptance
  useEffect(() => {
    socket.on(
      "receive-accept-invitation",
      ({ newNotice, groupId, userId, isForInvited }) => {
        const newChatLogs = cloneDeep(msgLogs.content);

        // for the new invited participants
        if (isForInvited) {
          // update the group invite notification
          notifsDispatch({
            type: NOTIF_CONTEXT_ACTIONS.loaded,
            payload: {
              ...notifs.content,
              inbox: notifs.content.inbox.map((ibx) => {
                if (ibx.group?._id !== groupId) return ibx;
                return { ...ibx, answer: true };
              }),
            },
          });

          socket.emit("get-a-full-chat", {
            token: sessionStorage.getItem("token"),
            gcId: groupId,
            pcId: "",
          });
        } else {
          // update the message log
          newChatLogs[groupId].invited = newChatLogs[groupId].invited.filter(
            (inv) => inv.user !== userId
          );
          newChatLogs[groupId].hasQuit = newChatLogs[groupId].hasQuit.filter(
            ({ user }) => user !== userId
          );
          newChatLogs[groupId].members.push(userId);

          // adding the new notice to the existing chat log
          const latestTimeGroup = last(newChatLogs[groupId].chat);
          latestTimeGroup.date === newNotice.date
            ? latestTimeGroup.messages.push(...newNotice.messages)
            : newChatLogs[groupId].chat.push(newNotice);

          msgLogsDispatch({
            type: MESSAGE_LOGS_ACTIONS.updateLoaded,
            payload: newChatLogs,
          });
        }
      }
    );

    return () => socket.off("receive-accept-invitation");
  }, [msgLogs.content, userState.user, notifs.content]);

  // for receiving group invite rejection
  useEffect(() => {
    socket.on("receive-reject-invitation", ({ groupId, userId }) => {
      // update the group invite notification

      const newNotifs = {
        ...notifs.content,
        inbox: notifs.content.inbox.map((ibx) =>
          ibx.group?._id !== groupId ? ibx : { ...ibx, answer: false }
        ),
      };

      notifsDispatch({
        type: NOTIF_CONTEXT_ACTIONS.loaded,
        payload: { ...newNotifs },
      });

      // update the message log
      if (groupId in msgLogs.content) {
        const newChatLogs = cloneDeep(msgLogs.content);

        newChatLogs[groupId].invited = newChatLogs[groupId].invited.filter(
          (inv) => inv.user !== userId
        );

        msgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.updateLoaded,
          payload: newChatLogs,
        });
      }
    });

    return () => socket.off("receive-reject-invitation");
  }, [userState.user, notifs.content]);

  // useEffect(() => {
  //   console.log(activeGroupChat);
  // }, [activeGroupChat]);

  return (
    <ActiveGroupChatContext.Provider
      value={{ activeGroupChat, setActiveGroupChat }}
    >
      {children}
    </ActiveGroupChatContext.Provider>
  );
}

export const makeNewGroup = ({
  chatId,
  name,
  users,
  createdAt,
  newNotice,
  msgLogs,
  msgLogsDispatch,
}) => {
  const updatedLogsContent = cloneDeep(msgLogs.content);
  const updatedMsgLogs = {
    [chatId]: {
      chatId,
      name,
      admins: users.admins,
      members: users.members,
      chat: [newNotice],
      type: "group",
      description: "",
      preview: true,
      profilePicture: "",
      hasQuit: [],
      createdAt,
    },
    ...updatedLogsContent,
  };

  // make a new group message log
  msgLogsDispatch({
    type: MESSAGE_LOGS_ACTIONS.updateLoaded,
    payload: updatedMsgLogs,
  });
};
