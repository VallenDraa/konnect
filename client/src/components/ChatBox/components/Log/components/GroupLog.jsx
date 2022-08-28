import { Fragment, useContext } from "react";
import { ActiveGroupChatContext } from "../../../../../context/activeGroupChat/ActiveGroupChatContext";
import { MessageLogsContext } from "../../../../../context/messageLogs/MessageLogsContext";
import { SettingsContext } from "../../../../../context/settingsContext/SettingsContext";
import { UserContext } from "../../../../../context/user/userContext";
import { chatPreviewTimeStatus } from "../../../../../utils/dates/dates";
import RenderIf from "../../../../../utils/React/RenderIf";
import Notice from "../../../../Message/Notice";
import GroupMessage from "../../../../Message/GroupMessage";
import { CachedUserContext } from "../../../../../context/cachedUser/CachedUserContext";
import { useEffect } from "react";
import { useState } from "react";

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
                          state={{
                            isSent: msg.isSent,
                            beenReadBy: msg.beenReadBy,
                          }}
                          sender={msg.by}
                          isSentByMe={msg.by === userState.user._id}
                          msg={msg.content}
                          time={new Date(msg.time)}
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
