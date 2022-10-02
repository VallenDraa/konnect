import { useEffect } from "react";
import { useContext, useState } from "react";
import { BiLogOut } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoPersonAdd } from "react-icons/io5";
import { ActiveGroupChatContext } from "../../../../../context/activeGroupChat/ActiveGroupChatContext";
import { MessageLogsContext } from "../../../../../context/messageLogs/MessageLogsContext";
import MODAL_ACTIONS from "../../../../../context/modal/modalActions";
import { ModalContext } from "../../../../../context/modal/modalContext";
import { UserContext } from "../../../../../context/user/userContext";
import { UrlHistoryContext } from "../../../../../pages/Home/Home";
import RenderIf from "../../../../../utils/React/RenderIf";
import Dropdown from "../../../../Dropdown/Dropdown";
import DropdownItem from "../../../../Dropdown/DropdownItem/DropdownItem";
import AddNewParticipants from "./AddNewParticipants";

export default function MoreMenu({ funcs }) {
  const { handleQuitGroup } = funcs; // this function is also used somewhere else
  const { modalDispatch } = useContext(ModalContext);
  const { urlHistory } = useContext(UrlHistoryContext);
  const { msgLogs } = useContext(MessageLogsContext);
  const { activeGroupChat } = useContext(ActiveGroupChatContext);
  const { userState } = useContext(UserContext);
  const [isAdmin, setIsAdmin] = useState(
    msgLogs.content[activeGroupChat]?.admins.some(
      (a) => a === userState.user._id
    )
  );

  // re check if user is admin
  useEffect(() => {
    setIsAdmin(() =>
      msgLogs.content[activeGroupChat]?.admins.some(
        (a) => a === userState.user._id
      )
    );
  }, [msgLogs.content, activeGroupChat]);

  return (
    <Dropdown
      className="ml-2"
      style={{ padding: "0.5rem 0.5rem" }}
      offset={15}
      fontSize={16}
      icon={<BsThreeDotsVertical />}
      position={"origin-top-right right-0"}
    >
      <RenderIf conditionIs={isAdmin}>
        <DropdownItem
          onClick={() => {
            modalDispatch({
              type: MODAL_ACTIONS.show,
              prevUrl: urlHistory?.current,
              onExitReturnToHome: false,
              content: <AddNewParticipants />,
            });
          }}
          className="flex items-center gap-x-1 text-sm"
          style={{ color: "rgb(75 85 99)" }}
        >
          <IoPersonAdd className="text-xs" />
          <span className="text-xs capitalize">Add Participants</span>
        </DropdownItem>
      </RenderIf>
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
