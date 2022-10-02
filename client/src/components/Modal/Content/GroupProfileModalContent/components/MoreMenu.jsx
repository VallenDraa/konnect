import { useContext } from "react";
import { BiLogOut } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoPersonAdd } from "react-icons/io5";
import { ActiveGroupChatContext } from "../../../../../context/activeGroupChat/ActiveGroupChatContext";
import { MessageLogsContext } from "../../../../../context/messageLogs/MessageLogsContext";
import { MiniModalContext } from "../../../../../context/miniModal/miniModalContext";
import { UserContext } from "../../../../../context/user/userContext";
import Dropdown from "../../../../Dropdown/Dropdown";
import DropdownItem from "../../../../Dropdown/DropdownItem/DropdownItem";

export default function MoreMenu({ funcs }) {
  const { handleQuitGroup } = funcs;

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
