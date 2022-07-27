import { Fragment, useContext } from "react";
import { ActiveChatContext } from "../../../../context/activeChat/ActiveChatContext";
import { MessageLogsContext } from "../../../../context/messageLogs/MessageLogsContext";
import { SettingsContext } from "../../../../context/settingsContext/SettingsContext";
import { UserContext } from "../../../../context/user/userContext";
import RenderIf from "../../../../utils/React/RenderIf";
import { Message } from "../../../Message/Message";

export default function Log({ messageLogRef }) {
  const { msgLogs } = useContext(MessageLogsContext);
  const { activeChat } = useContext(ActiveChatContext);
  const { userState } = useContext(UserContext);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  return (
    <ul
      ref={messageLogRef}
      aria-label="message-log"
      className={`relative flex flex-col h-0 grow pb-3 overflow-auto container mx-auto max-w-screen-sm lg:max-w-screen-lg
                ${general?.animation ? "scroll-smooth" : ""}`}
    >
      <RenderIf conditionIs={msgLogs.content}>
        {msgLogs?.content[activeChat._id]?.chat.map((log, i) => {
          return (
            <Fragment key={i}>
              <Message
                state={{ isSent: log.isSent, readAt: log.readAt }}
                isSentByMe={log.by === userState.user._id}
                msg={log.content}
                time={new Date(log.time)}
              />
            </Fragment>
          );
        })}
      </RenderIf>
    </ul>
  );
}
