import { Fragment, useContext } from "react";
import { ActivePrivateChatContext } from "../../../../../context/activePrivateChat/ActivePrivateChatContext";
import { MessageLogsContext } from "../../../../../context/messageLogs/MessageLogsContext";
import { SettingsContext } from "../../../../../context/settingsContext/SettingsContext";
import { UserContext } from "../../../../../context/user/userContext";
import { chatPreviewTimeStatus } from "../../../../../utils/dates/dates";
import PrivateMessage from "../../../../Message/PrivateMessage";
import Notice from "../../../../Message/Notice";
import tile from "../../../../../svg/home/tile.png";

export default function PrivateLog({ messageLogRef }) {
  const { msgLogs } = useContext(MessageLogsContext);
  const { activePrivateChat } = useContext(ActivePrivateChatContext);
  const { userState } = useContext(UserContext);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  return (
    <div
      style={{ backgroundImage: `url(${tile})` }}
      ref={messageLogRef}
      aria-label="message-log"
      className={`relative flex flex-col grow pb-3`}
    >
      <ul className="h-0 w-full grow overflow-auto max-w-screen-sm lg:max-w-screen-lg">
        {msgLogs.content[activePrivateChat._id] &&
          msgLogs?.content[activePrivateChat._id]?.chat?.map(
            ({ date, messages }, i) => {
              return (
                <Fragment key={i}>
                  <Notice>
                    {chatPreviewTimeStatus(new Date(), new Date(date), false)}
                  </Notice>

                  {messages.map((msg, i) => {
                    return (
                      <Fragment key={msg._id || i}>
                        <PrivateMessage
                          state={{
                            isSent: msg.isSent,
                            readAt: msg.readAt,
                          }}
                          isSentByMe={msg.by === userState.user._id}
                          msg={msg.content}
                          time={new Date(msg.time)}
                        />
                      </Fragment>
                    );
                  })}
                </Fragment>
              );
            }
          )}
      </ul>
    </div>
  );
}
