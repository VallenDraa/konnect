import { useContext, useEffect, useRef, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import RenderIf from "../../../../utils/React/RenderIf";
import EmojiBarToggle from "../EmojiBarToggle/EmojiBarToggle";
import Picker from "emoji-picker-react";
import { ActiveChatContext } from "../../../../context/activeChat/ActiveChatContext";
import { UserContext } from "../../../../context/user/userContext";
import {
  MessageLogsContext,
  pushNewEntry,
  pushNewMsgToEntry,
} from "../../../../context/messageLogs/MessageLogsContext";
import { SettingsContext } from "../../../../context/settingsContext/SettingsContext";
import socket from "../../../../utils/socketClient/socketClient";
import {
  scrollToBottom,
  scrollToBottomSmooth,
} from "../../../../utils/scroll/scrollToBottom";
import { cloneDeep } from "lodash";
import MESSAGE_LOGS_ACTIONS from "../../../../context/messageLogs/messageLogsActions";

export default function inputBar({ messageLogRef }) {
  const [isEmojiBarOn, setIsEmojiBarOn] = useState(false);
  const { activeChat } = useContext(ActiveChatContext);
  const { userState } = useContext(UserContext);
  const { msgLogs, msgLogsDispatch } = useContext(MessageLogsContext);
  const [newMessage, setnewMessage] = useState("");
  const inputRef = useRef();
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  const handleNewMessage = (e) => {
    e.preventDefault();
    if (newMessage === "") return;
    if (isEmojiBarOn) setIsEmojiBarOn(false);

    const newMessageInput = {
      _id: null,
      by: userState.user._id,
      to: activeChat._id,
      msgType: "text",
      content: newMessage,
      isSent: false,
      readAt: null,
      time: new Date().toISOString(),
    };

    // update the message logs
    msgLogs.content[activeChat._id]
      ? pushNewMsgToEntry({
          targetId: activeChat._id,
          message: newMessageInput,
          msgLogs,
          msgLogsDispatch,
        })
      : pushNewEntry({
          activeChat,
          targetId: activeChat._id,
          message: newMessageInput,
          msgLogs,
          chatId: null,
          msgLogsDispatch,
        });
    setTimeout(() => {
      general.animation
        ? scrollToBottomSmooth(messageLogRef.current)
        : scrollToBottom(messageLogRef.current);
    }, 100);

    // reset the input bar
    setnewMessage("");
    // send the message to the server
    // add a "to" field to the final object to indicate who the message is for
    socket.emit("new-msg", newMessageInput, sessionStorage.getItem("token"));
  };

  useEffect(() => {
    socket.on("msg-sent", ({ success, to, msgId, timeSent, chatId }) => {
      if (!success) return;
      /* NEW MSG LOGS*/

      const updatedChatLogs = cloneDeep(msgLogs.content);

      if (updatedChatLogs[to]) {
        const { chat: newChat } = updatedChatLogs[activeChat._id];
        const date = new Date().toLocaleDateString();
        const updatedTimeLogIdx = newChat.findIndex((m) => m.date === date);
        const msgsInTimeLog = newChat[updatedTimeLogIdx].messages;
        const msgsMaxLen = msgsInTimeLog.length - 1;

        if (msgsMaxLen > 0) {
          for (let i = msgsMaxLen; i > 0; i--) {
            if (msgsInTimeLog[i].time !== timeSent) continue;

            msgsInTimeLog[i].isSent = true;
            msgsInTimeLog[i]._id = msgId;
            break;
          }
        } else {
          if (msgsInTimeLog[msgsMaxLen].time === timeSent) {
            msgsInTimeLog[msgsMaxLen].isSent = true;
            msgsInTimeLog[msgsMaxLen]._id = msgId;
          }
        }

        updatedChatLogs[activeChat._id].chatId = chatId;
        msgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.updateLoaded,
          payload: updatedChatLogs,
        });
      }
    });

    return () => socket.off("msg-sent");
  }, [msgLogs]); // for changing the message state indicator

  const onEmojiClick = (e, data) => setnewMessage((msg) => msg + data.emoji);

  return (
    <footer className="sticky bottom-0 bg-gray-100">
      <form
        onSubmit={(e) => handleNewMessage(e)}
        className="flex items-center justify-center gap-3 py-3 px-5 max-w-screen-sm lg:max-w-full mx-auto"
      >
        {/* emoji btn */}
        <div aria-label="message-button-group" className="self-end">
          <EmojiBarToggle
            isEmojiBarOnState={{ isEmojiBarOn, setIsEmojiBarOn }}
          />
        </div>
        <RenderIf conditionIs={isEmojiBarOn}>
          <Picker
            pickerStyle={{
              shadow:
                "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
              borderRadius: "20px",
              position: "absolute",
              left: "25px",
              bottom: "60px",
            }}
            disableAutoFocus={true}
            native={true}
            onEmojiClick={onEmojiClick}
          />
        </RenderIf>
        {/* the input bar */}
        <input
          onDoubleClick={() => scrollToBottomSmooth(messageLogRef.current)}
          type="text"
          ref={inputRef}
          onChange={(e) => setnewMessage(e.target.value)}
          value={newMessage}
          className="bg-gray-200 pt-1.5 outline-none shadow focus:shadow-inner w-full
               rounded-full px-6 resize-none flex items-center justify-center h-8"
        />
        {/* the send msg btn */}
        <RenderIf conditionIs={newMessage !== ""}>
          <button
            className={`w-8 h-8 rounded-full bg-blue-300 text-white
                hover:bg-blue-400 focus:bg-blue-400 focus:shadow-inner transition 
                flex items-center justify-center shadow aspect-square text-xs 
                ${general?.animation ? `animate-pop-in` : ``}
                `}
          >
            <FaPaperPlane className="relative right-[1px]" />
          </button>
        </RenderIf>
      </form>
    </footer>
  );
}
