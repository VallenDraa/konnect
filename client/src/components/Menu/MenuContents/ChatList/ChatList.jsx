import { ChatPreview } from "./ChatPreview/ChatPreview";
import { useContext, useEffect, useState } from "react";
import RenderIf from "../../../../utils/React/RenderIf";
import { ActivePrivateChatContext } from "../../../../context/activePrivateChat/ActivePrivateChatContext";
import { MessageLogsContext } from "../../../../context/messageLogs/MessageLogsContext";
import { chatPreviewTimeStatus } from "../../../../utils/dates/dates";
import _ from "lodash";
import { ActiveGroupChatContext } from "../../../../context/activeGroupChat/ActiveGroupChatContext";

const EmptyPlaceholder = () => {
  return (
    <div className="text-center space-y-10 mt-10 p-3">
      <span className="block font-semibold text-xl lg:text-lg text-gray-500">
        Chat List Is Empty
      </span>
      <span className="text-gray-400 text-xs">
        Go start a chat by pressing{" "}
        <span className="font-semibold text-gray-500">New Chat !</span>
      </span>
    </div>
  );
};

export default function ChatList() {
  const { activePrivateChat } = useContext(ActivePrivateChatContext);
  const { activeGroupChat } = useContext(ActiveGroupChatContext);
  const { msgLogs } = useContext(MessageLogsContext);
  const [logsEntries, setLogsEntries] = useState(
    msgLogs?.content ? Object.entries(msgLogs?.content) : []
  );

  // refresh the entries everytime the msgLogs is updated
  useEffect(() => {
    if (!msgLogs || !msgLogs.content) return;

    const cloned = _.cloneDeep(msgLogs.content);
    const newEntries = Object.entries(cloned).sort((a, b) => {
      const content = 1;
      const { messages: prevMsgs } = _.last(a[content].chat);
      const { messages: currMsgs } = _.last(b[content].chat);

      return new Date(_.last(currMsgs).time) - new Date(_.last(prevMsgs).time);
    });

    // check if the new message logs and current one is the same
    if (
      JSON.stringify(Object.fromEntries(newEntries)) !==
      JSON.stringify(Object.fromEntries(logsEntries))
    ) {
      setLogsEntries(newEntries);
    }
  }, [msgLogs]);

  // determine what to return base on logsEntries length
  if (logsEntries.length === 0) return <EmptyPlaceholder />;

  const allChatIsEmpty = logsEntries.every(
    ([key, value]) => value.chat?.length === 0
  );
  return allChatIsEmpty ? (
    <EmptyPlaceholder />
  ) : (
    <ul className="p-3 space-y-4 absolute inset-0 overflow-auto">
      {/* if chat history exists */}
      <RenderIf conditionIs={logsEntries.length > 0}>
        {logsEntries.map(([_id, log]) => {
          // prove one time group exists
          const lastTimeGroup = _.last(log.chat);
          if (!lastTimeGroup) return;

          // prove one message exists
          const lastMsg = _.last(lastTimeGroup.messages);
          if (!lastMsg) return;

          switch (log.type) {
            case "private":
              return (
                <ChatPreview
                  type="private"
                  chatId={_id}
                  key={_id}
                  lastMessage={lastMsg}
                  timeSentArg={chatPreviewTimeStatus(
                    new Date(),
                    new Date(lastMsg.time)
                  )}
                  user={log.user}
                  isActive={_id === activePrivateChat?._id}
                />
              );

            case "group":
              return (
                <ChatPreview
                  type="group"
                  group={log}
                  chatId={log.chatId}
                  key={_id}
                  lastMessage={lastMsg}
                  timeSentArg={chatPreviewTimeStatus(
                    new Date(),
                    new Date(lastMsg.time)
                  )}
                  isActive={_id === activeGroupChat}
                />
              );
            default:
              break;
          }
        })}
      </RenderIf>
    </ul>
  );
}
