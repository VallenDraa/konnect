import { ImFileVideo } from "react-icons/im";
import { VscMegaphone } from "react-icons/vsc";
import { BsFileEarmarkImage, BsLink45Deg } from "react-icons/bs";
import { IoCall } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { MessageLogsContext } from "../../../../../context/messageLogs/MessageLogsContext";
import RenderIf from "../../../../../utils/React/RenderIf";
import { SettingsContext } from "../../../../../context/settingsContext/SettingsContext";
import { CloseChatLogContext } from "../../../../../pages/Home/Home";

export const ChatPreview = ({
  user,
  type,
  groupName,
  chatId,
  lastMessage,
  timeSentArg,
  isActive,
}) => {
  if (!lastMessage || !timeSentArg) return;
  const { msgUnread } = useContext(MessageLogsContext);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const { closeChatLog } = useContext(CloseChatLogContext);

  return (
    <li>
      <Link
        onClick={() => isActive && closeChatLog()}
        to={isActive ? "/chats" : `/chats?id=${chatId}&type=${type}`}
        className={`flex items-center p-2 cursor-pointer rounded-lg shadow group ${
          isActive
            ? "bg-blue-100 font-semibold"
            : "hover:bg-pink-100 bg-gray-100"
        } ${general?.animation ? "duration-200" : ""}`}
      >
        <div className="flex overflow-hidden grow">
          <div className="flex gap-2 overflow-hidden grow">
            <div className=" h-12 w-12 relative">
              <img
                src="https://picsum.photos/200/200"
                alt={type === "private" ? user.username : groupName}
                className="rounded-full absolute inset-0 z-10"
              />
              {/* notifications*/}
              <RenderIf conditionIs={msgUnread.detail[chatId]}>
                <RenderIf conditionIs={msgUnread.detail[chatId] > 0}>
                  <div
                    className={`inset-0 bg-gradient-to-tl from-pink-300/80 to-blue-300 rounded-full grid place-content-center text-lg hover:text-xl font-medium text-gray-800 absolute z-20 ${
                      general?.animation ? "animate-fade-in duration-200" : ""
                    }
                `}
                  >
                    {msgUnread.detail[chatId] <= 99
                      ? msgUnread.detail[chatId]
                      : "99+"}
                  </div>
                </RenderIf>
              </RenderIf>
            </div>
            <div className="flex flex-col gap-1 overflow-hidden">
              <span
                className={`truncate font-medium ${
                  isActive
                    ? "group-hover:text-blue-500"
                    : "group-hover:text-pink-700"
                } ${general?.animation ? "duration-200" : ""}`}
              >
                {type === "private" ? user.username : groupName}
              </span>
              <span
                className={`text-sm truncate text-gray-500 relative z-10 flex items-center gap-1 
                ${
                  isActive
                    ? "group-hover:text-blue-500"
                    : "group-hover:text-pink-700"
                } ${general?.animation ? "duration-200 transition-all" : ""}`}
              >
                {lastMessage.msgType === "image" && (
                  <>
                    <BsFileEarmarkImage />
                    {lastMessage.content}
                  </>
                )}
                {lastMessage.msgType === "video" && (
                  <>
                    <ImFileVideo />
                    {lastMessage.content}
                  </>
                )}
                {lastMessage.msgType === "text" && lastMessage.content}
                {lastMessage.msgType === "call" && (
                  <>
                    <IoCall />
                    {lastMessage.content}
                  </>
                )}
                {lastMessage.msgType === "link" && (
                  <>
                    <BsLink45Deg />
                    {lastMessage.content}
                  </>
                )}
                {lastMessage.msgType === "notice" && (
                  <>
                    <VscMegaphone />
                    {lastMessage.content}
                  </>
                )}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center basis-10 gap-y-2">
            <time
              className={`text-xxs self-center text-right basis-1/12 relative top-0.5 ${
                isActive
                  ? "group-hover:text-blue-400"
                  : "group-hover:text-pink-400"
              } ${general?.animation ? "duration-200 transition-all" : ""} `}
            >
              {timeSentArg}
            </time>
          </div>
        </div>
      </Link>
    </li>
  );
};
