import { useContext, useEffect, useState } from "react";
import FCMItem from "../FCMItem";
import { ActiveGroupChatContext } from "../../../context/activeGroupChat/ActiveGroupChatContext";
import { MessageLogsContext } from "../../../context/messageLogs/MessageLogsContext";
import { UserContext } from "../../../context/user/userContext";
import RenderIf from "../../../utils/React/RenderIf";
import { FaBan, FaKey, FaPaperPlane, FaUserAlt } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import NormalConfirmation from "../../MiniModal/content/NormalConfirmation";
import MINI_MODAL_ACTIONS from "../../../context/miniModal/miniModalActions";
import { MiniModalContext } from "../../../context/miniModal/miniModalContext";
import socket from "../../../utils/socketClient/socketClient";

export default function GroupModalFCMItem({ user, funcs }) {
  const { activeGroupChat } = useContext(ActiveGroupChatContext);
  const { msgLogs } = useContext(MessageLogsContext);
  const { userState } = useContext(UserContext);
  const { _id } = userState.user;
  const [isAdmin, setIsAdmin] = useState(
    msgLogs.content[activeGroupChat]?.admins.some((id) => id === _id)
  );
  const [isTargetAdmin, setIsTargetAdmin] = useState(
    msgLogs.content[activeGroupChat]?.admins.some((id) => id === user?._id)
  );
  const { miniModalState, miniModalDispatch } = useContext(MiniModalContext);
  const { handleQuitGroup } = funcs;

  // KICK USER FROM GROUP
  const kickFromGroupInDb = (payload) => {
    socket.emit("kick-from-group", payload);

    miniModalDispatch({ type: MINI_MODAL_ACTIONS.closing });
    miniModalDispatch({ type: MINI_MODAL_ACTIONS.closed });
  };
  const handleKick = () => {
    const payload = {
      groupId: msgLogs.content[activeGroupChat].chatId,
      kickedId: user._id,
      kickerId: userState.user._id,
      token: sessionStorage.getItem("token"),
    };

    if (!miniModalState.isActive) {
      miniModalDispatch({
        type: MINI_MODAL_ACTIONS.show,
        payload: {
          content: (
            <NormalConfirmation
              cb={kickFromGroupInDb}
              title={`Are You Sure You Want To Kick ${user.username} ?`}
              caption={`${user.username} won't be able to send or receive new messages`}
              payload={payload}
            />
          ),
        },
      });
    }
  };

  useEffect(() => {
    setIsAdmin(
      msgLogs.content[activeGroupChat]?.admins.some((id) => id === _id)
    );
  }, [msgLogs[activeGroupChat], _id, activeGroupChat]);

  return (
    <>
      {/* if the target user is not the current logged in person */}
      <RenderIf conditionIs={user?._id !== _id}>
        {/* view the target user's profile */}
        <FCMItem
          className="flex items-center gap-2 truncate"
          link={`/user/${user?.username}`}
        >
          <FaUserAlt className="text-xs basis-3" />
          View Profile
        </FCMItem>
        {/* send a message to target user */}
        <FCMItem
          className="flex items-center gap-2 truncate"
          link={`/chats?id=${user?._id}&type=private`}
        >
          <FaPaperPlane className="text-xs basis-3" />
          Send Message
        </FCMItem>
        <RenderIf conditionIs={isAdmin}>
          <RenderIf conditionIs={!isTargetAdmin}>
            {/* give admin status to target user */}
            <FCMItem className="flex items-center gap-2 truncate">
              <FaKey className="basis-3" />
              Give admin status
            </FCMItem>
          </RenderIf>
          <RenderIf conditionIs={isTargetAdmin}>
            {/* revoke admin status from target user*/}
            <FCMItem className="flex items-center gap-2 truncate">
              <FaKey className="basis-3" />
              Revoke admin status
            </FCMItem>
          </RenderIf>
          {/* kick user from group*/}
          <FCMItem onClick={handleKick}>
            <div className="text-red-400 flex items-center gap-2 truncate">
              <FaBan className="basis-3" />
              Kick user from group
            </div>
          </FCMItem>
        </RenderIf>
      </RenderIf>
      {/* if the target user is the current logged in person */}
      <RenderIf conditionIs={user?._id === _id}>
        {/* view the target user's profile */}
        <FCMItem
          className="flex items-center gap-2 truncate"
          link={`/user/${user?.username}`}
        >
          <FaUserAlt className="text-xs basis-3" />
          View Profile
        </FCMItem>
        <FCMItem className="flex items-center gap-2 truncate">
          <FaKey className="basis-3" />
          Revoke admin status
        </FCMItem>
        {/* quit from this group*/}
        <FCMItem onClick={handleQuitGroup}>
          <div className="text-red-400 flex items-center gap-2 truncate">
            <BiLogOut className="text-sm basis-3" />
            Quit
          </div>
        </FCMItem>
      </RenderIf>
    </>
  );
}
