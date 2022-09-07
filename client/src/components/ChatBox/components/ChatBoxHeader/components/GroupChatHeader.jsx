import { useEffect, useContext, useRef } from "react";
import { BsArrowLeftShort } from "react-icons/bs";
import { Link } from "react-router-dom";
import { ActiveGroupChatContext } from "../../../../../context/activeGroupChat/ActiveGroupChatContext";
import { MessageLogsContext } from "../../../../../context/messageLogs/MessageLogsContext";
import MODAL_ACTIONS from "../../../../../context/modal/modalActions";
import { ModalContext } from "../../../../../context/modal/modalContext";
import { SettingsContext } from "../../../../../context/settingsContext/SettingsContext";
import {
  CloseChatLogContext,
  UrlHistoryContext,
} from "../../../../../pages/Home/Home";
import RenderIf from "../../../../../utils/React/RenderIf";
import GroupProfileModalContent from "../../../../Modal/Content/GroupProfileModalContent/GroupProfileModalContent";

export default function GroupChatHeader({ invisibleWallRef }) {
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const { activeGroupChat, setActiveGroupChat } = useContext(
    ActiveGroupChatContext
  );
  const { modalDispatch } = useContext(ModalContext);
  const { msgLogs } = useContext(MessageLogsContext);
  const { closeChatLog } = useContext(CloseChatLogContext);
  const { urlHistory } = useContext(UrlHistoryContext);
  const showGroupProfile = () => {
    modalDispatch({
      type: MODAL_ACTIONS.show,
      prevUrl: urlHistory?.current,
      onExitReturnToHome: false,
      content: <GroupProfileModalContent />,
      title: msgLogs.content[activeGroupChat]?.name,
    });
  };

  return (
    <RenderIf conditionIs={msgLogs.content[activeGroupChat]}>
      <header className="h-14 bg-gray-50 shadow-inner py-2 px-2 lg:px-5 border-b-2">
        <div className="max-w-screen-sm lg:max-w-full mx-auto flex justify-between items-center">
          <div className="flex justify-between items-center w-full">
            {/* sidebar btn (will show up when screen is <lg) */}
            <div className="flex items-center justify-between gap-2">
              <Link
                onClick={() => {
                  closeChatLog();

                  invisibleWallRef.current.classList.remove("hidden");
                  setTimeout(
                    () => invisibleWallRef.current.classList.add("hidden"),
                    400
                  );
                }}
                to="/chats"
                className={`block hover:text-blue-400 text-3xl ${
                  general?.animation ? "duration-200" : ""
                }`}
              >
                <BsArrowLeftShort />
              </Link>
              {/* group profile  */}
              <button
                onClick={showGroupProfile}
                className="flex items-center gap-1.5"
              >
                <img
                  src="https://picsum.photos/200/200"
                  alt=""
                  className="rounded-full h-9 w-9"
                />
                <div className="flex flex-col items-start">
                  <span className="text-sm max-w-[200px] truncate">
                    {msgLogs.content[activeGroupChat]?.name}
                  </span>
                  <span className=" text-xs text-gray-500 relative z-10 max-w-[200px] truncate">
                    Group
                  </span>
                </div>
              </button>
            </div>

            {/* chat action buttons */}
            <div></div>
          </div>
        </div>
      </header>
    </RenderIf>
  );
}
