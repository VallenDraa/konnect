import { useEffect } from "react";
import { Fragment, useContext } from "react";
import { ActiveChatContext } from "../../../../context/activeChat/ActiveChatContext";
import { MessageLogsContext } from "../../../../context/messageLogs/MessageLogsContext";
import { SettingsContext } from "../../../../context/settingsContext/SettingsContext";
import { UserContext } from "../../../../context/user/userContext";
import { Message } from "../../../Message/Message";
import TimeSeparator from "./components/TimeSeparator";

export default function Log({ messageLogRef }) {
  const { newMsgLogs } = useContext(MessageLogsContext);
  const { activeChat } = useContext(ActiveChatContext);
  const { userState } = useContext(UserContext);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  useEffect(() => console.log(newMsgLogs), [newMsgLogs]);

  if (newMsgLogs.content[activeChat._id]) {
    return (
      <main className="bg-gray-100 flex flex-col grow">
        <ul
          ref={messageLogRef}
          aria-label="message-log"
          className={`relative flex flex-col h-0 grow pb-3 overflow-auto container mx-auto max-w-screen-sm lg:max-w-screen-lg ${
            general?.animation ? "scroll-smooth" : ""
          }`}
        >
          {newMsgLogs?.content[activeChat._id].chat.map(
            ({ date, messages }, i) => (
              <Fragment key={i}>
                <TimeSeparator now={new Date()} then={new Date(date)} />

                {messages.map((msg) => (
                  <Fragment key={msg._id}>
                    <Message
                      state={{ isSent: msg.isSent, readAt: msg.readAt }}
                      isSentByMe={msg.by === userState.user._id}
                      msg={msg.content}
                      time={new Date(msg.time)}
                    />
                  </Fragment>
                ))}
              </Fragment>
            )
          )}
        </ul>
      </main>
    );
  }
}
