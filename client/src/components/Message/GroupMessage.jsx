import { useContext, useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiCheckDouble } from "react-icons/bi";
import { CachedUserContext } from "../../context/cachedUser/CachedUserContext";
import { SettingsContext } from "../../context/settingsContext/SettingsContext";
import { UserContext } from "../../context/user/userContext";
import RenderIf from "../../utils/React/RenderIf";

export default function GroupMessage({
  innerRef = null,
  state,
  msg,
  time,
  isSentByMe,
  sender,
}) {
  const formattedTime = time
    .toTimeString()
    .slice(0, time.toTimeString().lastIndexOf(":"));
  const { settings } = useContext(SettingsContext);
  const { userState } = useContext(UserContext);
  const { general } = settings;
  const { fetchCachedUsers } = useContext(CachedUserContext);
  const [senderUsername, setSenderUsername] = useState(sender);

  useEffect(() => {
    (async () => {
      try {
        if (sender === userState.user._id) {
          setSenderUsername(userState.user.username);
        } else {
          const { username } = await fetchCachedUsers(sender);
          setSenderUsername(username);
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return (
    <li
      ref={innerRef}
      aria-label="message"
      className={`h-max flex items-center mt-5 ${
        isSentByMe ? "justify-end" : ""
      } ${isSentByMe ? "pr-5 lg:pr-8" : "pl-5 lg:pl-8"} ${
        general?.animation ? "animate-pop-in" : ""
      }`}
    >
      <div
        className={`max-w-[75%] flex flex-col relative rounded-lg shadow space-y-2 min-w-[100px] p-2 ${
          isSentByMe ? "bg-white" : " bg-gray-300"
        }`}
      >
        <span className="text-xxs px-1  text-gray-600 absolute -top-5 inset-x-0 truncate">
          {senderUsername}
        </span>

        <span className={`text-gray-800 leading-5 lg:leading-6 self-start`}>
          {msg}
        </span>

        <div
          className={`text-xxs flex items-center gap-2 self-end ${
            isSentByMe ? "justify-between" : "justify-start"
          }`}
        >
          <time
            className={`font-light ${
              isSentByMe ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {formattedTime}
          </time>

          <RenderIf conditionIs={isSentByMe}>
            <RenderIf
              conditionIs={!state?.isSent && state?.beenReadBy?.length === 0}
            >
              <AiOutlineLoading3Quarters
                className={`self-start text-gray-400 ${
                  general?.animation ? "animate-spin animate-fade-in" : ""
                }`}
              />
            </RenderIf>
            <RenderIf conditionIs={state?.isSent}>
              <BiCheckDouble
                className={`text-xl self-start text-gray-400 ${
                  general?.animation ? "animate-fade-in" : ""
                }`}
              />
            </RenderIf>
          </RenderIf>
        </div>
      </div>
    </li>
  );
}
