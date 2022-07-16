import { useEffect, useState, Fragment, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaPaperPlane } from 'react-icons/fa';
import { createPopup } from '@picmo/popup-picker';
import RenderIf from '../../utils/React/RenderIf';
import { StartScreen } from '../StartScreen/StartScreen';
import socket from '../../utils/socketClient/socketClient';
import { useContext } from 'react';
import { UserContext } from '../../context/user/userContext';
import getUsersPreview from '../../utils/apis/getusersPreview';
import { Message } from '../Message/Message';
import {
  ActiveChatContext,
  ACTIVE_CHAT_DEFAULT,
} from '../../context/activeChat/ActiveChatContext';
import { MessageLogsContext } from '../../context/messageLogs/MessageLogsContext';
import MESSAGE_LOGS_ACTIONS from '../../context/messageLogs/messageLogsActions';
import throttle from '../../utils/performance/throttle';
import getScrollPercentage, {
  isWindowScrollable,
} from '../../utils/scroll/getScrollPercentage';
import { BsArrowLeftShort, BsEmojiSmile } from 'react-icons/bs';

export const pushNewEntry = async ({
  targetId,
  token,
  message = null,
  currentActiveChatId,
  msgLogs,
  dispatch,
}) => {
  dispatch({ type: MESSAGE_LOGS_ACTIONS.startUpdate });
  try {
    const [user] = await getUsersPreview(token, targetId);
    const isActiveChat = currentActiveChatId === targetId;
    const updatedMsgLogs = msgLogs;

    // assemble the final result object
    const newMessageLogContent = {
      user,
      chatId: message ? message.chatId : null,
      chat: message ? [message] : [],
      activeChat: isActiveChat,
    };
    updatedMsgLogs.content[targetId] = newMessageLogContent;

    // save the new message log
    dispatch({
      type: MESSAGE_LOGS_ACTIONS.updateLoaded,
      payload: updatedMsgLogs.content,
    });
  } catch (error) {
    console.log(error);
  }
};

export const pushNewMsgToEntry = ({ targetId, message, dispatch, msgLogs }) => {
  const updatedMsgLogs = msgLogs;
  updatedMsgLogs.content[targetId].chat.push(message);

  dispatch({
    type: MESSAGE_LOGS_ACTIONS.updateLoaded,
    payload: updatedMsgLogs.content,
  });
};

export const ChatBox = ({ sidebarState }) => {
  const { activeChat, setActiveChat } = useContext(ActiveChatContext);
  const { msgLogs, msgLogsDispatch } = useContext(MessageLogsContext);
  const { userState } = useContext(UserContext);
  const { isSidebarOn, setIsSidebarOn } = sidebarState;
  const [newMessage, setnewMessage] = useState('');
  const location = useLocation();
  const [willGoToBottom, setWillGoToBottom] = useState(false);
  const emojiPickerRef = useRef();
  const [emojiPicker, setEmojiPicker] = useState(null);

  // INITIAL LOADING USE EFFECT
  useEffect(() => {
    if (location.pathname === '/chats') {
      // if (location.pathname + location.search === urlHistory.prev) return;

      const search = Object.fromEntries(
        location.search
          .slice(1, location.search.length)
          .split('&')
          .map((q) => q.split('='))
      );

      // check if the url provided id and type of chat
      if (search.id && search.type) {
        if (activeChat._id === null) {
          // assemble the new active chat state
          const newActiveChat = {
            _id: search.id,
            activeChat: true,
            initials: null,
            lastMessage: null,
            profilePicture: null,
            username: null,
          };

          // execute different code according to the search type
          switch (search.type) {
            case 'user':
              // fetch the initials, profile picture, and username from the server
              getUsersPreview(sessionStorage.getItem('token'), [search.id])
                .then((userPrev) => {
                  Object.assign(newActiveChat, userPrev[0]);
                  setActiveChat(newActiveChat);
                  setIsSidebarOn(false);
                })
                .catch((err) => console.log(err));

              break;

            case 'group':
              break;

            default:
              break;
          }
        }
      }
    }
  }, [location]); // to check if the url is directed to a certain chat

  useEffect(() => {
    if (!msgLogs?.content[activeChat._id]) return;

    // check if the active chat has a lastMessage in the message log
    if (!activeChat.lastMessage) {
      const { chat } = msgLogs.content[activeChat._id];

      if (chat.length > 0) {
        // const assemble the new active chat
        const newDatas = { ...activeChat, lastMessage: chat[chat.length - 1] };

        setActiveChat(newDatas);
      }
    }
  }, [msgLogs]); // refresh the active chat message log if it is still empty
  // END OF INITIAL LOADING USE EFFECT

  useEffect(() => {
    let picker;

    const pickEmoji = (emoji) => {
      setnewMessage((msg) => msg + emoji);
    };
    const initEmoji = (position = 'auto', rootElement) => {
      picker = createPopup(
        { animate: true, emojiSize: '1.5rem' },
        {
          referenceElement: rootElement,
          triggerElement: rootElement,
          hideOnEmojiSelect: false,
          hideOnEscape: false,
          showCloseButton: false,
          className: '',
          position: 'auto-start',
        }
      );

      picker.addEventListener('emoji:select', ({ emoji }) => pickEmoji(emoji));

      setEmojiPicker(picker);
    };

    // init emoji picker
    setTimeout(() => initEmoji('auto', emojiPickerRef.current), 1000);

    return () => {
      picker.removeEventListener('emoji:select', ({ emoji }) =>
        pickEmoji(emoji)
      );
      picker.destroy();
    };
  }, []); //emoji picker controller

  useEffect(() => {
    window.scrollTo({ top: window.scrollMaxY });
  }, [activeChat]); // will go to the bottom of the screen when active chat changes

  useEffect(() => {
    setWillGoToBottom(isWindowScrollable());
  }, [activeChat]); // see if window is scrollable when active user is changed

  useEffect(() => {
    // check if the page is atleast scrolled by 70%
    const scrollCb = throttle(() => {
      const scrollPercent = getScrollPercentage();

      setWillGoToBottom(scrollPercent > 70 ? true : false);
    }, 200);

    window.addEventListener('scroll', scrollCb);

    return () => window.removeEventListener('scroll', scrollCb);
  }, []); //automatically scroll down to the latest message

  useEffect(() => {
    socket.on('receive-msg', async (data) => {
      const { message, chatId, success } = data;
      const assembledMsg = { ...message, chatId };

      console.log(message);

      // update the message logs
      msgLogs.content[message.by]
        ? pushNewMsgToEntry({
            targetId: message.by,
            message: assembledMsg,
            dispatch: msgLogsDispatch,
            msgLogs,
          })
        : // if chat log doesn't exist for this user
          pushNewEntry({
            msgLogs,
            targetId: message.by,
            message: assembledMsg,
            token: sessionStorage.getItem('token'),
            currentActiveChatId: activeChat._id,
            dispatch: msgLogsDispatch,
          });

      // update the active chat last message so that when receiver see it, the message can be flag as read
      setActiveChat({ ...activeChat, lastMessage: message });

      // read msg if current active chat is the same user that sent the message

      willGoToBottom && window.scrollTo({ top: window.scrollMaxY });
    });

    return () => socket.off('receive-msg');
  }, [msgLogs, userState, activeChat]); // receiving message for recipient only code

  useEffect(() => {
    if (!activeChat._id) return;
    if (!msgLogs) return;
    if (!msgLogs?.content[activeChat._id]) return;
    if (!msgLogs?.content[activeChat._id]?.chatId) return;
    if (activeChat.lastMessage?.by === userState.user._id) return;

    const updatedMsgLogs = msgLogs.content[activeChat._id];

    if (updatedMsgLogs.chat.length > 0) {
      const currMsgLog = updatedMsgLogs.chat;
      const finalMesIndex = updatedMsgLogs.chat.length - 1;

      // only execute if the last message is not sent by this user
      if (currMsgLog[finalMesIndex].by !== userState.user._id) {
        const token = sessionStorage.getItem('token');

        if (currMsgLog[finalMesIndex].readAt === null) {
          // // update local message read status
          // for (let i = currMsgLog.length - 1; i > 0; i--) {
          //   if (currMsgLog[i].readAt !== null) break;

          //   currMsgLog.chat[i].readAt = time;
          // }

          // msgLogsDispatch({
          //   type: MESSAGE_LOGS_ACTIONS.updateLoaded,
          //   payload: updatedMsgLogs.content,
          // });

          // update the message read status to the server
          socket.emit(
            'read-msg',
            new Date().toISOString(),
            token,
            activeChat._id,
            updatedMsgLogs.chatId
          );
          window.scrollTo({ top: window.scrollMaxY });
        }
      }
    }
  }, [activeChat, msgLogs]); //set the message to read

  useEffect(() => {
    socket.on('msg-on-read', (isRead, recipientId, time) => {
      if (isRead) {
        if (!msgLogs.content[recipientId]) return;

        msgLogsDispatch({ type: MESSAGE_LOGS_ACTIONS.startUpdate });
        const updatedMsgLogs = msgLogs;
        const { chat } = updatedMsgLogs.content[activeChat._id];

        for (let i = chat.length - 1; i > 0; i--) {
          if (chat[i].readAt !== null) break;

          chat[i].readAt = time;
        }

        msgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.updateLoaded,
          payload: updatedMsgLogs.content,
        });

        setTimeout(() => window.scrollTo({ top: window.scrollMaxY }), 250);
      }
    });

    return () => socket.off('msg-on-read');
  }, [msgLogs]); //msg onread

  useEffect(() => {
    socket.on('msg-sent', ({ success, message, chatId, timeSent }) => {
      if (!success) return;
      // console.log(chatId, success);

      // start the update sequence
      msgLogsDispatch({ type: MESSAGE_LOGS_ACTIONS.startUpdate });
      const updatedMsgLogs = msgLogs;

      if (updatedMsgLogs.content[message.to]) {
        const chatContent = updatedMsgLogs.content[message.to].chat;

        // loop over the array of chats and find the one where the time sent matches, then update the isSent field into true
        for (const chat of chatContent) {
          if (chat.time === timeSent) {
            chat.isSent = true;
            break;
          }
        }

        // fill the chat log id
        updatedMsgLogs.content[message.to].chatId = chatId;

        msgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.updateLoaded,
          payload: updatedMsgLogs.content,
        });

        // when finish sending message go straight to the bottom
        setTimeout(() => window.scrollTo({ top: window.scrollMaxY }), 250);
      }
    });

    return () => socket.off('msg-sent');
  }, [msgLogs]); // for changing the message state indicator

  // useEffect(() => {
  //   if (!msgLogs?.content[activeChat._id]) return;
  //   const lastIndex = msgLogs?.content[activeChat._id].chat.length - 1; //last index of the the message log
  //   const { readAt } = msgLogs?.content[activeChat._id].chat[lastIndex];
  //   if (!readAt) return;

  //   const timeMessageSent = new Date(readAt);

  //   const sentAt = getSentAtStatus(new Date(), timeMessageSent);

  //   switch (sentAt) {
  //     case 'today':
  //       const formattedTime = timeMessageSent
  //         .toTimeString()
  //         .slice(0, timeMessageSent.toTimeString().lastIndexOf(':'));

  //       return setTimeMessageRead(formattedTime);

  //     case 'yesterday':
  //       return setTimeMessageRead('a day ago');

  //     case 'long ago':
  //       return setTimeMessageRead(timeMessageSent.toLocaleDateString());
  //     default:
  //       break;
  //   }
  // }, [msgLogs, activeChat]); //for determining the time sent

  const handleNewMessage = (e) => {
    e.preventDefault();
    if (newMessage === '') return;

    const newMessageInput = {
      by: userState.user._id,
      to: activeChat._id,
      msgType: 'text',
      content: newMessage,
      isSent: false,
      readAt: null,
      time: new Date().toISOString(),
    };

    // update the message logs
    msgLogs.content[activeChat._id]
      ? pushNewMsgToEntry({
          msgLogs,
          targetId: activeChat._id,
          message: newMessageInput,
          dispatch: msgLogsDispatch,
        })
      : pushNewEntry({
          msgLogs,
          targetId: activeChat._id,
          message: newMessageInput,
          token: sessionStorage.getItem('token'),
          currentActiveChatId: activeChat._id,
          dispatch: msgLogsDispatch,
        });
    setTimeout(() => window.scrollTo({ top: window.scrollMaxY }), 150);

    // reset the input bar
    setnewMessage('');
    // send the message to the server
    // add a "to" field to the final object to indicate who the message is for
    socket.emit('new-msg', newMessageInput, sessionStorage.getItem('token'));
  };

  const handleGoToMenu = () => {
    setIsSidebarOn(!isSidebarOn);
    setActiveChat(ACTIVE_CHAT_DEFAULT);
  };

  const handleEmojiPicker = () => {
    emojiPicker.isOpen ? emojiPicker.close() : emojiPicker.open();
  };

  return (
    <>
      <RenderIf conditionIs={!activeChat?.username}>
        <StartScreen handleGoToMenu={handleGoToMenu} />
      </RenderIf>
      <RenderIf conditionIs={activeChat?.username}>
        <main className="basis-full lg:basis-3/4 shadow-inner bg-gray-100 min-h-screen relative flex flex-col">
          <header className="h-14 sticky top-0 inset-x-0 z-10 bg-gray-50 shadow-inner p-2 border-b-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                {/* sidebar btn (will show up when screen is <lg) */}
                <Link
                  to="/chats"
                  onClick={handleGoToMenu}
                  className="block lg:hidden hover:text-blue-400 duration-200 text-3xl"
                >
                  <BsArrowLeftShort />
                </Link>
                {/* profile  */}
                <Link
                  to={`user/${activeChat.username}`}
                  className="flex items-center gap-1"
                >
                  <img
                    src="https://picsum.photos/200/200"
                    alt=""
                    className="rounded-full h-9 w-9"
                  />
                  <div className="flex flex-col items-start">
                    <span className="text-sm max-w-[200px] truncate">
                      {activeChat.username}
                    </span>
                    <span className="text-xs text-gray-500 relative z-10 max-w-[200px] truncate">
                      Status
                    </span>
                  </div>
                </Link>

                {/* chat action buttons */}
                <div></div>
              </div>
            </div>
          </header>
          <main className="max-w-screen-lg w-full mx-auto relative flex flex-col grow">
            {/* message */}
            <ul aria-label="chat-log" className="p-3 bg-gray-100 grow">
              {msgLogs?.content[activeChat._id]?.chat.map((log, i) => {
                return (
                  <Fragment key={i}>
                    <Message
                      state={{ isSent: log.isSent, readAt: log.readAt }}
                      isSentByMe={log.by === userState.user._id}
                      msg={log.content}
                      time={new Date(log.time)}
                    />
                  </Fragment>
                );
              })}
            </ul>
          </main>
          {/* input */}
          <form
            onSubmit={(e) => handleNewMessage(e)}
            className="sticky bg-gray-100 bottom-0 min-h-[1rem] flex items-center justify-center gap-3 py-2 px-5"
          >
            <div aria-label="message-button-group" className="self-end">
              <button
                disabled={emojiPicker ? false : true}
                type="button"
                ref={emojiPickerRef}
                onClick={() => emojiPicker && handleEmojiPicker()}
                className={`text-xl disabled:cursor-not-allowed disabled:animate-pulse disabled:text-gray-500 text-gray-700 duration-200`}
              >
                <BsEmojiSmile />
              </button>
            </div>
            <input
              type="text"
              onChange={(e) => setnewMessage(e.target.value)}
              value={newMessage}
              className="bg-gray-200 pt-1.5 outline-none shadow focus:shadow-inner w-full
                         rounded-full px-6 resize-none flex items-center justify-center h-8 transition"
            />
            <RenderIf conditionIs={newMessage !== ''}>
              <button
                className="w-10 h-10 max-w-[40px] max-h-[40px] rounded-full bg-blue-300 text-white
                          hover:bg-blue-400 focus:bg-blue-400 focus:shadow-inner transition 
                          flex items-center justify-center shadow aspect-square text-xs animate-pop-in"
              >
                <FaPaperPlane className="relative right-[1px]" />
              </button>
            </RenderIf>
          </form>
        </main>
      </RenderIf>
    </>
  );
};
