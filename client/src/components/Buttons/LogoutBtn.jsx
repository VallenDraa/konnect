import { useContext } from "react";
import { BiLogOut } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import {
  ActivePrivateChatContext,
  ACTIVE_PRIVATE_CHAT_DEFAULT,
} from "../../context/activePrivateChat/ActivePrivateChatContext";
import { ActiveGroupChatContext } from "../../context/activeGroupChat/ActiveGroupChatContext";
import USER_ACTIONS from "../../context/user/userAction";
import { UserContext } from "../../context/user/userContext";
import socket from "../../utils/socketClient/socketClient";
import Pill from "./Pill";
import { ModalContext } from "../../context/modal/modalContext";
import MODAL_ACTIONS from "../../context/modal/modalActions";

export default function LogoutBtn() {
  const { userState, userDispatch } = useContext(UserContext);
  const { setActivePrivateChat } = useContext(ActivePrivateChatContext);
  const { setActiveGroupChat } = useContext(ActiveGroupChatContext);
  const { modalDispatch } = useContext(ModalContext);
  const Navigate = useNavigate();

  const handleLogout = () => {
    socket.emit("logout", userState.user._id, (success, message) => {
      if (success) {
        // deactivate chat
        setActivePrivateChat(ACTIVE_PRIVATE_CHAT_DEFAULT);
        setActiveGroupChat(null);

        // close the modal so that when a user logs back in, it doesn't jitter
        modalDispatch({ type: MODAL_ACTIONS.close });

        userDispatch({ type: USER_ACTIONS.logout });
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refreshToken");
        Navigate("/login");
      } else {
        console.error(message);
      }
    });
  };
  return (
    <Pill
      onClick={handleLogout}
      className="w-full border-red-500 bg-red-100 hover:bg-red-500 active:bg-red-500 text-red-500 hover:text-white active:text-white shadow-red-100 hover:shadow-red-200 active:shadow-red-200"
    >
      <BiLogOut />
      <span>Log Out</span>
    </Pill>
  );
}
