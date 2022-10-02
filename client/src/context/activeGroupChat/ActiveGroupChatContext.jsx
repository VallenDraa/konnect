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

export const ActiveGroupChatContext = createContext("");

export default function ActiveGroupChatContextProvider({ children }) {
  const [activeGroupChat, setActiveGroupChat] = useState("");
  const { msgLogs, msgLogsDispatch } = useContext(MessageLogsContext);
  const { setTitle } = useContext(TitleContext);
  const { userState, userDispatch } = useContext(UserContext);
  const { miniModalDispatch } = useContext(MiniModalContext);

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
