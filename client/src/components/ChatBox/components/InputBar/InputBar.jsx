import { useContext, useEffect, useRef, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import RenderIf from "../../../../utils/React/RenderIf";
import EmojiBarToggle from "../EmojiBarToggle/EmojiBarToggle";
import Picker from "emoji-picker-react";
import { ActivePrivateChatContext } from "../../../../context/activePrivateChat/ActivePrivateChatContext";
import { UserContext } from "../../../../context/user/userContext";
import {
  MessageLogsContext,
  pushNewPrivateEntry,
  pushNewMsgToEntry,
} from "../../../../context/messageLogs/MessageLogsContext";
import { SettingsContext } from "../../../../context/settingsContext/SettingsContext";
import socket from "../../../../utils/socketClient/socketClient";
import {
  scrollToBottom,
  scrollToBottomSmooth,
} from "../../../../utils/scroll/scrollToBottom";

import { useLocation } from "react-router-dom";
import { ActiveGroupChatContext } from "../../../../context/activeGroupChat/ActiveGroupChatContext";

export default function inputBar({ messageLogRef }) {
  const [isEmojiBarOn, setIsEmojiBarOn] = useState(false);
  const { activePrivateChat } = useContext(ActivePrivateChatContext);
  const { activeGroupChat } = useContext(ActiveGroupChatContext);
  const { userState } = useContext(UserContext);
  const { msgLogs, msgLogsDispatch } = useContext(MessageLogsContext);
  const [newMessage, setnewMessage] = useState("");
  const inputRef = useRef();
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const { search } = useLocation();

  const handleNewMessage = (e) => {
    e.preventDefault();
    if (newMessage === "") return;
    if (isEmojiBarOn) setIsEmojiBarOn(false);

    // get the message type from the url
    const [key, chatType] = search.split("&")[1].split("=");

    const msgInterface = {
      _id: null,
      chatId: activeGroupChat,
      by: userState.user._id,
      msgType: "text",
      content: newMessage,
      isSent: false,
      time: new Date().toISOString(),
    };

    const newMessageInput =
      chatType === "private" ? { ...msgInterface, readAt: null } : msgInterface;

    // update the message logs
    // check whether the active chat is private or group
    msgLogs.content[activePrivateChat._id || activeGroupChat]
      ? pushNewMsgToEntry({
          targetId: activePrivateChat._id || activeGroupChat,
          message: newMessageInput,
          msgLogs,
          msgLogsDispatch,
        })
      : pushNewPrivateEntry({
          type: chatType,
          targetId: activePrivateChat._id || activeGroupChat,
          message: newMessageInput,
          token: sessionStorage.getItem("token"),
          msgLogs,
          chatId: activeGroupChat || null,
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
    socket.emit(
      "new-msg",
      newMessageInput,
      chatType,
      sessionStorage.getItem("token")
    );
  };

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
