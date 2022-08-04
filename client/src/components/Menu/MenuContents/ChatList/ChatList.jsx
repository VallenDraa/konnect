import { ChatPreview } from "./ChatPreview/ChatPreview";
import { useContext, useEffect, useState } from "react";
import RenderIf from "../../../../utils/React/RenderIf";
import { ActivePrivateChatContext } from "../../../../context/activePrivateChat/ActivePrivateChatContext";
import { MessageLogsContext } from "../../../../context/messageLogs/MessageLogsContext";
import { chatPreviewTimeStatus } from "../../../../utils/dates/dates";
import { cloneDeep } from "lodash";
import lastIdx from "../../../../utils/others/lastIdx";

export default function ChatList() {
  const { activePrivateChat } = useContext(ActivePrivateChatContext);
  const { msgLogs } = useContext(MessageLogsContext);
  const [logsEntries, setLogsEntries] = useState(
    msgLogs?.content ? Object.entries(msgLogs?.content) : []
  );

  // refresh the entries everytime the msgLogs is updated
  useEffect(() => {
    if (!msgLogs || !msgLogs.content) return;

    const newEntries = Object.entries(cloneDeep(msgLogs.content));
    // check if the new message logs and current one is the same
    if (
      JSON.stringify(Object.fromEntries(newEntries)) !==
      JSON.stringify(Object.fromEntries(logsEntries))
    ) {
      setLogsEntries(newEntries);
    }
  }, [msgLogs, logsEntries]);
  // useEffect(() => {
  //   console.log(logsEntries);
  // }, [logsEntries]);

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

  // determine what to return base on logsEntries length
  if (logsEntries.length === 0) {
    return <EmptyPlaceholder />;
  } else {
    const allChatIsEmpty = logsEntries.every(
      ([key, value]) => value.chat?.length === 0
    );

    if (allChatIsEmpty) {
      return <EmptyPlaceholder />;
    } else {
      return (
        <ul className="p-3 flex flex-col gap-y-4">
          {/* if chat history exists */}
          <RenderIf conditionIs={logsEntries.length > 0}>
            {logsEntries.map(([_id, { user, chat, chatId }]) => {
              const lastMsgIdx = lastIdx(chat[lastIdx(chat)].messages);

              if (lastMsgIdx !== -1) {
                const lastMsg = chat[lastIdx(chat)].messages[lastMsgIdx];

                return (
                  <ChatPreview
                    chatId={chatId}
                    key={_id}
                    lastMessage={lastMsg}
                    timeSentArg={chatPreviewTimeStatus(
                      new Date(),
                      new Date(lastMsg.time)
                    )}
                    user={user}
                    isActive={_id === activePrivateChat?._id}
                  />
                );
              }
            })}
          </RenderIf>
        </ul>
      );
    }
  }
}
