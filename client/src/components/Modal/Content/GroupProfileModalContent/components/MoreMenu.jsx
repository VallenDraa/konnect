import { useContext } from "react";
import { BiLogOut } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoPersonAdd } from "react-icons/io5";
import { ActiveGroupChatContext } from "../../../../../context/activeGroupChat/ActiveGroupChatContext";
import { MessageLogsContext } from "../../../../../context/messageLogs/MessageLogsContext";
import MINI_MODAL_ACTIONS from "../../../../../context/miniModal/miniModalActions";
import { MiniModalContext } from "../../../../../context/miniModal/miniModalContext";
import { UserContext } from "../../../../../context/user/userContext";
import socket from "../../../../../utils/socketClient/socketClient";
import Dropdown from "../../../../Dropdown/Dropdown";
import DropdownItem from "../../../../Dropdown/DropdownItem/DropdownItem";
import NormalConfirmation from "../../../../MiniModal/content/NormalConfirmation";

export default function MoreMenu() {
  const { activeGroupChat } = useContext(ActiveGroupChatContext);
  const { userState } = useContext(UserContext);
  const { msgLogs } = useContext(MessageLogsContext);
  const { miniModalState, miniModalDispatch } = useContext(MiniModalContext);

  // QUIT GROUP
  const quitGroupInDb = (payload) => {
    socket.emit("quit-group", payload);

    // close the mini modal
    miniModalDispatch({ type: MINI_MODAL_ACTIONS.closing });
    miniModalDispatch({ type: MINI_MODAL_ACTIONS.closed });
  };
  const handleQuitGroup = () => {
    const payload = {
      groupId: msgLogs.content[activeGroupChat].chatId,
      userId: userState.user._id,
      token: sessionStorage.getItem("token"),
    };

    if (!miniModalState.isActive) {
      miniModalDispatch({
        type: MINI_MODAL_ACTIONS.show,
        payload: {
          content: (
            <NormalConfirmation
              cb={quitGroupInDb}
              title="Are You Sure You Want To Quit This Group ?"
              caption="You won't be able to send or receive new messages"
              payload={payload}
            />
          ),
        },
      });
    }
  };

  return (
    <Dropdown
      className="ml-2"
      style={{ padding: "0.5rem 0.5rem" }}
      offset={15}
      fontSize={16}
      icon={<BsThreeDotsVertical />}
      position={"origin-top-right right-0"}
    >
      <DropdownItem
        className="flex items-center gap-x-1 text-sm"
        style={{ color: "rgb(75 85 99)" }}
      >
        <IoPersonAdd className="text-xs" />
        <span className="text-xs capitalize">Add Participants</span>
      </DropdownItem>
      <DropdownItem
        onClick={handleQuitGroup}
        className="flex items-center gap-x-1 text-sm"
        style={{ color: "rgb(239 68 68)" }}
      >
        <BiLogOut className="text-xs" />
        <span className="text-xs capitalize">Quit</span>
      </DropdownItem>
    </Dropdown>
  );
}
