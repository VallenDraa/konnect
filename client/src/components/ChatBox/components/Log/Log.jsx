import { useEffect, useState } from "react";
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
  const [groupedMsgLogs, setGroupedMsgLogs] = useState([
    { date: null, messages: [] },
  ]);

  useEffect(() => {
    const result = [];

    msgLogs?.content[activeChat._id]?.chat?.forEach((msg, i) => {
      if (i === 0) {
        result.push({
          date: new Date(msg.time).toLocaleDateString(),
          messages: [msg],
        });
      } else {
        const { time: past } = msgLogs?.content[activeChat._id]?.chat[i - 1];
        const { time: curr } = msg;
        const datePast = new Date(past).toLocaleDateString();
        const dateCurr = new Date(curr).toLocaleDateString();

        if (datePast !== dateCurr) {
          result.push({ date: dateCurr, messages: [msg] });
        } else {
          const timeGroupIdx = result.findIndex(
            ({ date }) => date === dateCurr
          );

          timeGroupIdx === -1
            ? result.push({ date: dateCurr, messages: [msg] })
            : result[timeGroupIdx].messages.push(msg);
        }
      }
    });

    setGroupedMsgLogs(result);
  }, [msgLogs, activeChat]);

  return (
    <main className="bg-gray-100 flex flex-col grow">
      <ul
        ref={messageLogRef}
        aria-label="message-log"
        className={`relative flex flex-col h-0 grow pb-3 overflow-auto container mx-auto max-w-screen-sm lg:max-w-screen-lg ${
          general?.animation ? "scroll-smooth" : ""
        }`}
      >
        <RenderIf conditionIs={groupedMsgLogs.length > 0}>
          {groupedMsgLogs.map(({ date, messages }, i) => {
            return (
              <Fragment key={i}>
                <TimeSeparator now={new Date()} then={new Date(date)} />

                {messages.map((msg) => {
                  return (
                    <Message
                      key={msg._id}
                      state={{ isSent: msg.isSent, readAt: msg.readAt }}
                      isSentByMe={msg.by === userState.user._id}
                      msg={msg.content}
                      time={new Date(msg.time)}
                    />
                  );
                })}
              </Fragment>
            );
          })}
        </RenderIf>
      </ul>
    </main>
  );
}
