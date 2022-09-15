import { useContext, useRef } from "react";
import { BsArrowLeftShort } from "react-icons/bs";
import { Link } from "react-router-dom";
import { ActivePrivateChatContext } from "../../../../../context/activePrivateChat/ActivePrivateChatContext";
import { SettingsContext } from "../../../../../context/settingsContext/SettingsContext";
import { CloseChatLogContext } from "../../../../../pages/Home/Home";
import { chatPreviewTimeStatus } from "../../../../../utils/dates/dates";
import PP from "../../../../PP/PP";

export default function PrivateChatHeader({ invisibleWallRef }) {
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const statusRef = useRef();
  const { activePrivateChat } = useContext(ActivePrivateChatContext);
  const { closeChatLog } = useContext(CloseChatLogContext);

  const StatusSwitcher = ({ isOnline, lastSeen }) => {
    let status;

    switch (true) {
      case isOnline:
        status = "Online";
        break;

      case !isOnline && lastSeen:
        const currStatus = chatPreviewTimeStatus(
          new Date(),
          new Date(lastSeen)
        );
        status = "Last seen at " + currStatus;
        break;

      default:
        return;
    }

    // add refresh animation if the status is different from the previous one
    if (status !== statusRef.current?.textContent) {
      statusRef.current?.classList?.add("animate-fade-in");
      setTimeout(() => {
        statusRef.current?.classList?.remove("animate-fade-in");
      }, 200);
    }
    return status;
  };

  return (
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
            {/* profile  */}
            <Link
              to={`user/${activePrivateChat?.username}`}
              className="flex items-center gap-1.5"
            >
              <PP
                src={activePrivateChat?.profilePicture || null}
                alt={activePrivateChat?.username}
                type="private"
                className="rounded-full h-9 w-9"
              />

              <div className="flex flex-col items-start">
                <span className="text-sm max-w-[200px] truncate">
                  {activePrivateChat?.username}
                </span>
                <span
                  ref={statusRef}
                  className="text-xs text-gray-500 relative z-10 max-w-[200px] truncate"
                >
                  <StatusSwitcher
                    isOnline={activePrivateChat?.isOnline}
                    lastSeen={activePrivateChat?.lastSeen}
                  />
                </span>
              </div>
            </Link>
          </div>

          {/* chat action buttons */}
          <div></div>
        </div>
      </div>
    </header>
  );
}
