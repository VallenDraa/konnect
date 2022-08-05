import { useContext } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiCheck, BiCheckDouble } from "react-icons/bi";
import { SettingsContext } from "../../context/settingsContext/SettingsContext";
import RenderIf from "../../utils/React/RenderIf";

export const Message = ({
  innerRef = null,
  state,
  msg,
  time,
  isSentByMe,
  // ,state
}) => {
  const formattedTime = time
    .toTimeString()
    .slice(0, time.toTimeString().lastIndexOf(":"));
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

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
        className={`max-w-[75%] rounded-lg shadow p-3 space-y-2 min-w-[100px] ${
          isSentByMe ? "bg-white" : " bg-gray-300"
        }`}
      >
        <span className={`text-gray-800 leading-5 lg:leading-6  self-start`}>
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
            {/* check if message hasn't been sent or read yet */}
            <RenderIf conditionIs={!state.isSent && !state.readAt}>
              <AiOutlineLoading3Quarters
                className={`self-start text-gray-400 ${
                  general?.animation ? "animate-spin animate-fade-in" : ""
                }`}
              />
            </RenderIf>

            {/* check if message has been sent but not read yet */}
            <RenderIf conditionIs={state.isSent}>
              <BiCheckDouble
                className={`text-xl self-start ${
                  state.readAt ? "text-blue-400" : "text-gray-400"
                } ${general?.animation ? "animate-fade-in" : ""}`}
              />
            </RenderIf>
          </RenderIf>
        </div>
      </div>
    </li>
  );
};
