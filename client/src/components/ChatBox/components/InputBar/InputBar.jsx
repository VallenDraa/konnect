import { useContext, useEffect, useRef, useState } from "react";
import { FaPaperPlane, FaTrashAlt } from "react-icons/fa";
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
import MINI_MODAL_ACTIONS from "../../../../context/miniModal/miniModalActions";
import NormalConfirmation from "../../../MiniModal/content/NormalConfirmation";
import { MiniModalContext } from "../../../../context/miniModal/miniModalContext";
import Pill from "../../../Buttons/Pill";

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
  const { miniModalState, miniModalDispatch } = useContext(MiniModalContext);
  const [hasQuitGroup, setHasQuitgroup] = useState(
    activeGroupChat &&
      msgLogs.content[activeGroupChat]?.hasQuit.some(
        (u) => u.user === userState.user._id
      )
  );

  // for handling group chat input bar when the user has quit or been kicked
  useEffect(() => {
    setHasQuitgroup(
      activeGroupChat &&
        msgLogs.content[activeGroupChat]?.hasQuit.some(
          (u) => u.user === userState.user._id
        )
    );
  }, [activeGroupChat, msgLogs.content]);

  const handleNewMessage = (e) => {
    e.preventDefault();
    if (newMessage === "") return;
    if (isEmojiBarOn) setIsEmojiBarOn(false);
    const userId = userState.user._id;

    // get the message type from the url
    const [key, chatType] = search.split("&")[1].split("=");

    const msgInterface = {
      _id: null,
      by: userId,
      msgType: "text",
      content: newMessage,
      isSent: false,
      time: new Date().toISOString(),
    };

    const newMessageInput =
      chatType === "private"
        ? { ...msgInterface, readAt: null, to: activePrivateChat._id }
        : {
            ...msgInterface,
            chatId: activeGroupChat,
            beenReadBy: [{ readAt: msgInterface.time, user: userId }],
          };

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

  // REMOVE GROUP FROM USER'S GROUP LIST
  const removeGroupFromList = (payload) => socket.emit("remove-group", payload);
  const handleRemoveGroup = () => {
    const payload = {
      groupId: msgLogs.content[activeGroupChat].chatId,
      userId: userState.user._id,
      token: sessionStorage.getItem("token"),
    };

    if (!miniModalState.isActive) {
      miniModalDispatch({
        type: MINI_MODAL_ACTIONS.show,
        payload: {
          content: (
            <NormalConfirmation
              cb={removeGroupFromList}
              title="Are You Sure You Want To Remove This Chat Log ?"
              caption="You won't be able to access this chat log anymore"
              payload={payload}
            />
          ),
        },
      });
    }
  };
  //for when the normal confirmation tab is opened and can't be closed because the chat log has been deleted

  return (
    <footer
      className={`sticky bottom-0 ${
        hasQuitGroup ? "bg-gray-200" : "bg-transparent"
      }`}
    >
      <RenderIf conditionIs={!hasQuitGroup}>
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
            className="bg-gray-200 pt-1.5 outline-none shadow focus:shadow-inner w-full rounded-full px-6 resize-none flex items-center justify-center h-8"
          />
          {/* the send msg btn */}
          <RenderIf conditionIs={newMessage !== ""}>
            <button
              className={`w-8 h-8 rounded-full bg-blue-300 text-white
                hover:bg-blue-400 focus:bg-blue-400 focus:shadow-inner transition 
                flex items-center justify-center shadow aspect-square text-xs ${
                  general?.animation ? `animate-pop-in` : ``
                }`}
            >
              <FaPaperPlane className="relative right-[1px]" />
            </button>
          </RenderIf>
        </form>
      </RenderIf>
      <RenderIf conditionIs={hasQuitGroup}>
        <span className="text-gray-500 mx-2 mt-4  block text-center font-medium">
          You're unable to send or receive a new message, as you're no longer a
          participant of this group
        </span>
        <Pill
          onClick={handleRemoveGroup}
          className="max-w-[150px] mx-auto my-4 w-full border-[1.5px] shadow border-red-500  hover:bg-red-500 active:bg-red-500 text-red-500 hover:text-white active:text-white shadow-red-100 hover:shadow-red-200 active:shadow-red-200"
        >
          <FaTrashAlt />
          <span>Remove Chat</span>
        </Pill>
        <div className="h-3 w-full bg-gray-300 shadow-xl"></div>
      </RenderIf>
    </footer>
  );
}
