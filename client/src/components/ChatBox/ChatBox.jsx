import { useEffect, useState, Fragment, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaPaperPlane } from 'react-icons/fa';
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
import { BsArrowLeftShort } from 'react-icons/bs';
import Picker from 'emoji-picker-react';
import EmojiBarToggle from './components/EmojiBarToggle/EmojiBarToggle';
import notifSound from '../../audio/notifSound.mp3';
import { playAudio } from '../../utils/AudioPlayer/audioPlayer';

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
  const notifSFX = new Audio(notifSound);
  const { activeChat, setActiveChat } = useContext(ActiveChatContext);
  const { msgLogs, msgLogsDispatch } = useContext(MessageLogsContext);
  const { userState } = useContext(UserContext);
  const { isSidebarOn, setIsSidebarOn } = sidebarState;
  const [newMessage, setnewMessage] = useState('');
  const location = useLocation();
  const [willGoToBottom, setWillGoToBottom] = useState(false);
  const [isEmojiBarOn, setIsEmojiBarOn] = useState(false);
  const inputRef = useRef();
  const messageLogRef = useRef();

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
    if (!messageLogRef.current) return;

    messageLogRef.current.scrollTop = messageLogRef.current.scrollHeight;
  }, [activeChat, messageLogRef]); // will go to the bottom of the screen when active chat changes

  useEffect(() => {
    setWillGoToBottom(isWindowScrollable());
  }, [activeChat]); // see if window is scrollable when active user is changed

  useEffect(() => {
    // check if the page is atleast scrolled by 70%
    const scrollCb = throttle(() => {
      const scrollPercent = getScrollPercentage();

      setWillGoToBottom(scrollPercent > 70 ? true : false);
    }, 200);

    messageLogRef.current?.addEventListener('scroll', scrollCb);

    return () => messageLogRef.current?.removeEventListener('scroll', scrollCb);
  }, []); //automatically scroll down to the latest message

  useEffect(() => {
    socket.on('receive-msg', async (data) => {
      const { message, chatId, success } = data;
      const assembledMsg = { ...message, chatId };

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

      // play notification audio when receiving a message
      playAudio(notifSFX);

      // read msg if current active chat is the same user that sent the message
      if (willGoToBottom) {
        messageLogRef.current.scrollTop = messageLogRef.current.scrollHeight;
      }
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
          messageLogRef.current.scrollTop = messageLogRef.current.scrollHeight;
        }
      }
    }
  }, [activeChat, msgLogs]); //set the message to read

  useEffect(() => {
    socket.on('msg-on-read', (isRead, recipientId, time) => {
      if (isRead) {
        if (!msgLogs.content[recipientId]) return;
        if (!msgLogs.content[activeChat._id]) return;

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

        setTimeout(
          () => {
            messageLogRef.current.scrollTop =
              messageLogRef.current.scrollHeight;
          },

          250
        );
      }
    });

    return () => socket.off('msg-on-read');
  }, [msgLogs, activeChat]); //msg onread

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
        setTimeout(
          () => {
            messageLogRef.current.scrollTop =
              messageLogRef.current.scrollHeight;
          },

          250
        );
      }
    });

    return () => socket.off('msg-sent');
  }, [msgLogs]); // for changing the message state indicator

  const handleNewMessage = (e) => {
    e.preventDefault();
    if (newMessage === '') return;
    if (isEmojiBarOn) setIsEmojiBarOn(false);

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
    setTimeout(() => {
      messageLogRef.current.scrollTop = messageLogRef.current.scrollHeight;
    }, 150);

    // reset the input bar
    setnewMessage('');
    // send the message to the server
    // add a "to" field to the final object to indicate who the message is for
    socket.emit('new-msg', newMessageInput, sessionStorage.getItem('token'));
  };

  const handleGoToMenu = () => {
    setIsSidebarOn(!isSidebarOn);

    setTimeout(() => setActiveChat(ACTIVE_CHAT_DEFAULT), 330);
  };

  const onEmojiClick = (e, data) => setnewMessage((msg) => msg + data.emoji);

  return (
    <>
      <RenderIf conditionIs={!activeChat?.username}>
        <StartScreen handleGoToMenu={handleGoToMenu} />
      </RenderIf>
      <RenderIf conditionIs={activeChat?.username}>
        <main className="basis-full lg:basis-3/4 shadow-inner bg-gray-100 min-h-screen flex flex-col">
          <header className="h-14 bg-gray-50 shadow-inner p-2 border-b-2 flex justify-between items-center">
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
          </header>

          {/* message */}
          <ul
            ref={messageLogRef}
            aria-label="message-log"
            className="bg-gray-100 relative flex flex-col h-0 grow pb-3 overflow-auto"
          >
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

          {/* input */}
          <form
            onSubmit={(e) => handleNewMessage(e)}
            className="sticky bottom-0 flex items-center justify-center gap-3 py-3 px-5 bg-gray-100"
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
                    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                  borderRadius: '20px',
                  position: 'absolute',
                  left: '25px',
                  bottom: '60px',
                }}
                disableAutoFocus={true}
                native={true}
                onEmojiClick={onEmojiClick}
              />
            </RenderIf>
            {/* the input bar */}
            <input
              type="text"
              ref={inputRef}
              onChange={(e) => setnewMessage(e.target.value)}
              value={newMessage}
              className="bg-gray-200 pt-1.5 outline-none shadow focus:shadow-inner w-full
                         rounded-full px-6 resize-none flex items-center justify-center h-8"
            />
            {/* the send msg btn */}
            <RenderIf conditionIs={newMessage !== ''}>
              <button
                className="w-8 h-8 rounded-full bg-blue-300 text-white
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
