import { Fragment, useContext } from "react";
import { ActiveGroupChatContext } from "../../../../../context/activeGroupChat/ActiveGroupChatContext";
import { MessageLogsContext } from "../../../../../context/messageLogs/MessageLogsContext";
import { SettingsContext } from "../../../../../context/settingsContext/SettingsContext";
import { UserContext } from "../../../../../context/user/userContext";
import { chatPreviewTimeStatus } from "../../../../../utils/dates/dates";
import RenderIf from "../../../../../utils/React/RenderIf";
import Notice from "../../../../Message/Notice";
import GroupMessage from "../../../../Message/GroupMessage";

const showSender = (i, messages) => {
  if (i === 0) return true;
  return messages[i - 1].by === messages[i].by ? false : true;
};

export default function PrivateLog({ messageLogRef }) {
  const { msgLogs } = useContext(MessageLogsContext);
  const { activeGroupChat } = useContext(ActiveGroupChatContext);
  const { userState } = useContext(UserContext);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  return (
    <ul
      id="log"
      ref={messageLogRef}
      aria-label="message-log"
      className={`relative flex flex-col h-0 grow pb-3 overflow-auto container mx-auto max-w-screen-sm lg:max-w-screen-lg`}
    >
      {msgLogs.content[activeGroupChat] &&
        msgLogs?.content[activeGroupChat]?.chat?.map(
          ({ date, messages }, i) => {
            return (
              <Fragment key={i}>
                <Notice>
                  {chatPreviewTimeStatus(new Date(), new Date(date), false)}
                </Notice>

                {messages.map((msg, i) => {
                  return (
                    <Fragment key={msg._id === null ? i : msg._id}>
                      <RenderIf conditionIs={msg.msgType !== "notice"}>
                        <GroupMessage
                          key={msg._id}
                          msg={msg}
                          showSender={
                            msg.by === userState.user._id
                              ? false
                              : showSender(i, messages)
                          }
                        />
                      </RenderIf>
                      <RenderIf conditionIs={msg.msgType === "notice"}>
                        <Notice>{msg.content}</Notice>
                      </RenderIf>
                    </Fragment>
                  );
                })}
              </Fragment>
            );
          }
        )}
    </ul>
  );
}
