import { Fragment, useContext } from "react";
import { ActiveChatContext } from "../../../../context/activeChat/ActiveChatContext";
import { MessageLogsContext } from "../../../../context/messageLogs/MessageLogsContext";
import { SettingsContext } from "../../../../context/settingsContext/SettingsContext";
import { UserContext } from "../../../../context/user/userContext";
import { getDayDifference } from "../../../../utils/dates/dates";
import RenderIf from "../../../../utils/React/RenderIf";
import { Message } from "../../../Message/Message";
import TimeSeparator from "./components/TimeSeparator";

export default function Log({ messageLogRef }) {
  const { msgLogs } = useContext(MessageLogsContext);
  const { activeChat } = useContext(ActiveChatContext);
  const { userState } = useContext(UserContext);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  return (
    <main className="bg-gray-100 flex flex-col grow">
      <ul
        ref={messageLogRef}
        aria-label="message-log"
        className={`relative flex flex-col h-0 grow pb-3 overflow-auto container mx-auto max-w-screen-sm lg:max-w-screen-lg ${
          general?.animation ? "scroll-smooth" : ""
        }`}
      >
        <RenderIf conditionIs={msgLogs.content}>
          {msgLogs?.content[activeChat._id]?.chat.map((log, i) => {
            return (
              <Fragment key={i}>
                {/* the time separator */}
                <>
                  {/* the initial time separator */}
                  <RenderIf conditionIs={i === 0}>
                    <TimeSeparator now={new Date()} then={new Date(log.time)} />
                  </RenderIf>
                  {/* the incoming ones */}
                  <RenderIf conditionIs={i > 0}>
                    <RenderIf
                      conditionIs={
                        getDayDifference(
                          new Date(log.time),
                          new Date(
                            msgLogs?.content[activeChat._id]?.chat[i - 1]?.time
                          )
                        ) > 1
                      }
                    >
                      <TimeSeparator
                        now={new Date(log.time)}
                        then={
                          new Date(
                            msgLogs?.content[activeChat._id]?.chat[i - 1]?.time
                          )
                        }
                      />
                    </RenderIf>
                  </RenderIf>
                </>

                {/* the message */}
                <>
                  <Message
                    state={{ isSent: log.isSent, readAt: log.readAt }}
                    isSentByMe={log.by === userState.user._id}
                    msg={log.content}
                    time={new Date(log.time)}
                  />
                </>
              </Fragment>
            );
          })}
        </RenderIf>
      </ul>
    </main>
  );
}
