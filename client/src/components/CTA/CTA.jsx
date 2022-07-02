import { useContext } from "react";
import { IoPeopleSharp, IoCall, IoChatbubbles } from "react-icons/io5";
import MODAL_ACTIONS from "../../context/modal/modalActions";
import { ModalContext } from "../../context/modal/modalContext";
import Pill from "../Buttons/Pill";
import NewChat from "./contents/NewChat/NewChat";
import NewGroup from "./contents/NewGroup/NewGroup";
import StartCall from "./contents/StartCall/StartCall";
import { Link } from "react-router-dom";

export default function CTA({ className = "flex justify-evenly gap-2" }) {
  const { modalDispatch } = useContext(ModalContext);
  return (
    <div className={className}>
      <Pill
        className="hover:bg-gray-200 active:bg-gray-300 max-w-[130px]"
        onClick={() =>
          modalDispatch({
            type: MODAL_ACTIONS.show,
            onExitReturnToHome: true,
            content: <StartCall />,
          })
        }
      >
        <Link className="flex items-center gap-1" to="/new/call">
          <IoCall />
          Start Call
        </Link>
      </Pill>
      <Pill
        className="hover:bg-gray-200 active:bg-gray-300 max-w-[130px]"
        onClick={() =>
          modalDispatch({
            type: MODAL_ACTIONS.show,
            onExitReturnToHome: true,
            content: <NewChat />,
          })
        }
      >
        <Link className="flex items-center gap-1" to="/new/chat">
          <IoChatbubbles />
          New Chat
        </Link>
      </Pill>
      <Pill
        className="hover:bg-gray-200 active:bg-gray-300 max-w-[130px]"
        onClick={() =>
          modalDispatch({
            type: MODAL_ACTIONS.show,
            onExitReturnToHome: true,
            content: <NewGroup />,
          })
        }
      >
        <Link className="flex items-center gap-1" to="/new/group">
          <IoPeopleSharp />
          New Group
        </Link>
      </Pill>
    </div>
  );
}
