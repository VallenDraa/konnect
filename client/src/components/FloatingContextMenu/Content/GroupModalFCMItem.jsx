import { useContext, useEffect, useState } from "react";
import FCMItem from "../FCMItem";
import { ActiveGroupChatContext } from "../../../context/activeGroupChat/ActiveGroupChatContext";
import { MessageLogsContext } from "../../../context/messageLogs/MessageLogsContext";
import { UserContext } from "../../../context/user/userContext";
import RenderIf from "../../../utils/React/RenderIf";
import {
  FaBan,
  FaKey,
  FaPaperPlane,
  FaUserAlt,
  FaUserPlus,
} from "react-icons/fa";
import { IoPersonAdd } from "react-icons/io5";

export default function GroupModalFCMItem({ user }) {
  const { activeGroupChat, setActiveGroupChat } = useContext(
    ActiveGroupChatContext
  );
  const { msgLogs } = useContext(MessageLogsContext);
  const { userState } = useContext(UserContext);
  const { _id } = userState.user;
  const [isAdmin, setIsAdmin] = useState(
    msgLogs.content[activeGroupChat]?.admins.some((id) => id == _id)
  );

  useEffect(() => {
    setIsAdmin(
      msgLogs.content[activeGroupChat]?.admins.some((id) => id == _id)
    );
  }, [msgLogs, _id]);

  return (
    <>
      {/* go to the target user's profile */}
      <FCMItem
        className="flex items-center gap-2"
        link={`/user/${user?.username}`}
      >
        <FaUserAlt className="text-xs" />
        Go To {user?.username}'s Profile
      </FCMItem>
      {/* send a message to target user */}
      <FCMItem
        className="flex items-center gap-2"
        link={`/chats?id=${user?._id}&type=private`}
      >
        <FaPaperPlane className="text-xs" />
        Message {user?.username}
      </FCMItem>
      {/* send a contact request to the target user */}
      <FCMItem className="flex items-center gap-2 relative">
        <FaUserPlus className="text-sm absolute left-2" />
        <span className="ml-5">Send contact request</span>
      </FCMItem>
      <RenderIf conditionIs={isAdmin}>
        {/* make user to be an admin*/}
        <FCMItem className="flex items-center gap-2">
          <FaKey />
          Make {user?.username} an admin
        </FCMItem>
        {/* kick user from group*/}
        <FCMItem className="bg-red-100 hover:bg-red-200">
          <div className="text-red-400 flex items-center gap-2">
            <FaBan />
            Kick user from group
          </div>
        </FCMItem>
      </RenderIf>
    </>
  );
}
