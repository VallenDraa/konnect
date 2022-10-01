import { useContext, createContext, useEffect, useState } from "react";
import { cloneDeep, last } from "lodash";
import MESSAGE_LOGS_ACTIONS from "../messageLogs/messageLogsActions";
import { TitleContext } from "../titleContext/TitleContext";
import { MessageLogsContext } from "../messageLogs/MessageLogsContext";
import socket from "../../utils/socketClient/socketClient";

export const ActiveGroupChatContext = createContext("");

export default function ActiveGroupChatContextProvider({ children }) {
  const [activeGroupChat, setActiveGroupChat] = useState("");
  const { msgLogs, msgLogsDispatch } = useContext(MessageLogsContext);
  const { setTitle } = useContext(TitleContext);

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
  }, [activeGroupChat, msgLogs]);

  // for receiving group edits
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
  }, [msgLogs]);

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
