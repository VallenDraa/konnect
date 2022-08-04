import { useContext, useRef } from "react";
import { BsArrowLeftShort } from "react-icons/bs";
import { Link } from "react-router-dom";
import { SettingsContext } from "../../../../context/settingsContext/SettingsContext";
import { ActivePrivateChatContext } from "../../../../context/activePrivateChat/ActivePrivateChatContext";
import { chatPreviewTimeStatus } from "../../../../utils/dates/dates";

export default function ChatBoxHeader({ invisibleWallRef }) {
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const { activePrivateChat } = useContext(ActivePrivateChatContext);
  const statusRef = useRef();

  const statusSwitcher = (isOnline, lastSeen) => {
    let status;

    if (isOnline) {
      status = "Online";
    } else if (!isOnline && lastSeen) {
      status =
        "Last seen at " + chatPreviewTimeStatus(new Date(), new Date(lastSeen));
    } else {
      status = "Offline";
    }
    // add refresh animation if the status is different from the previous one
    if (status !== statusRef.current?.textContent) {
      statusRef.current?.classList.add("animate-fade-in");
      setTimeout(() => {
        statusRef.current?.classList.remove("animate-fade-in");
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
                invisibleWallRef.current.classList.remove("hidden");

                setTimeout(
                  () => invisibleWallRef.current.classList.add("hidden"),
                  400
                );
              }}
              to="/chats"
              className={`block lg:hidden hover:text-blue-400 text-3xl ${
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
              <img
                src="https://picsum.photos/200/200"
                alt=""
                className="rounded-full h-9 w-9"
              />
              <div className="flex flex-col items-start">
                <span className="text-sm max-w-[200px] truncate">
                  {activePrivateChat?.username}
                </span>
                <span
                  ref={statusRef}
                  className=" text-xs text-gray-500 relative z-10 max-w-[200px] truncate"
                >
                  {statusSwitcher(
                    activePrivateChat?.isOnline,
                    activePrivateChat?.lastSeen
                  )}
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
