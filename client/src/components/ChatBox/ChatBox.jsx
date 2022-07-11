import { useEffect, useState, Fragment, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaPaperPlane } from 'react-icons/fa';
import { HiOutlineMenu } from 'react-icons/hi';
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
import { getSentAtStatus } from '../../utils/dates/dates';
import { BiCheckDouble } from 'react-icons/bi';
import throttle from '../../utils/throttle';
import getScrollPercentage, {
  isWindowScrollable,
} from '../../utils/getScrollPercentage';
import { useDetectFirstRender } from '../../utils/hooks/useDetectFirstRender/useDetectFirstRender';

export const ChatBox = ({ sidebarState }) => {
  const { activeChat, setActiveChat } = useContext(ActiveChatContext);
  const { msgLogs, msgLogsDispatch } = useContext(MessageLogsContext);
  const chatBoxRef = useRef();
  const { userState } = useContext(UserContext);
  const { isSidebarOn, setIsSidebarOn } = sidebarState;
  const [newMessage, setnewMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [target, setTarget] = useState({ targetId: null, chatType: null }); //target id
  const [isMsgWillBeRead, setIsMsgWillBeRead] = useState(false);
  const [timeMessageRead, setTimeMessageRead] = useState(null);
  const [willGoToBottom, setWillGoToBottom] = useState(false);
  const isFirstRender = useDetectFirstRender();

  const pushNewEntry = async (
    targetId,
    message,
    token,
    currentActiveChatId
  ) => {
    msgLogsDispatch({ type: MESSAGE_LOGS_ACTIONS.startUpdate });
    try {
      const [user] = await getUsersPreview(token, targetId);
      const isActiveChat = currentActiveChatId === targetId;
      const updatedMsgLogs = msgLogs;

      // deactivate other chats if the current one is active
      for (const id in updatedMsgLogs.content) {
        updatedMsgLogs.content[id].activeChat = false;
      }

      // assemble the final result object
      const newMessageLogContent = {
        user,
        lastMessageReadAt: null,
        chat: [message],
        activeChat: isActiveChat,
      };
      updatedMsgLogs.content[targetId] = newMessageLogContent;

      // save the new message log
      msgLogsDispatch({
        type: MESSAGE_LOGS_ACTIONS.updateLoaded,
        payload: updatedMsgLogs.content,
      });
    } catch (error) {
      console.log(error);
    }
  };
  const pushNewMsgToEntry = (targetId, message) => {
    const updatedMsgLogs = msgLogs;
    updatedMsgLogs.content[targetId].lastMessageReadAt = null;
    updatedMsgLogs.content[targetId].chat.push(message);

    msgLogsDispatch({
      type: MESSAGE_LOGS_ACTIONS.updateLoaded,
      payload: updatedMsgLogs.content,
    });
  };

  useEffect(() => {
    document.body.style.overflowY = 'hidden';

    setTimeout(() => {
      document.body.style.overflowY = 'auto';
      window.scrollTo({ top: window.scrollMaxY });
    }, 300);
  }, [activeChat]);

  useEffect(() => {
    setWillGoToBottom(isWindowScrollable());
  }, [activeChat]); // see if window is scrollable when active user is changed

  useEffect(() => {
    if (isFirstRender && window.innerWidth <= 768) return;

    willGoToBottom && window.scrollTo({ top: window.scrollMaxY });
  }, [willGoToBottom]);

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
    socket.on('receive-message', async ({ message, success }) => {
      // update the message logs
      // if chat log doesn't exist for this user
      !msgLogs.content[message.by]
        ? pushNewEntry(
            message.by,
            message,
            sessionStorage.getItem('token'),
            activeChat._id
          )
        : pushNewMsgToEntry(message.by, message);

      // read msg if current active chat is the same user that sent the message
      if (activeChat._id === message.by) setIsMsgWillBeRead(true);
      willGoToBottom && window.scrollTo({ top: window.scrollMaxY });
    });

    return () => socket.off('receive-message');
  }, [msgLogs, userState, activeChat]); // receiving message for recipient only code

  useEffect(() => {
    if (isMsgWillBeRead) {
      if (!activeChat._id) return;
      if (!msgLogs.content[activeChat._id]) return;

      const activeChatLog = msgLogs.content[activeChat._id];

      if (activeChatLog.chat.length > 0) {
        const currMsgLog = activeChatLog.chat;
        const finalMesIndex = activeChatLog.chat.length - 1;

        if (currMsgLog[finalMesIndex].by !== userState.user._id) {
          const token = sessionStorage.getItem('token');

          socket.emit(
            'read-msg',
            new Date().toISOString(),
            token,
            activeChat._id
          );
          setIsMsgWillBeRead(false);
          window.scrollTo({ top: window.scrollMaxY });
        }
      }
    }
  }, [activeChat, msgLogs, isMsgWillBeRead]); //set the message to read

  useEffect(() => {
    socket.on('msg-on-read', (isRead, recipientId, time) => {
      if (isRead) {
        msgLogsDispatch({ type: MESSAGE_LOGS_ACTIONS.startUpdate });

        const updatedMsgLogs = msgLogs;

        updatedMsgLogs.content[recipientId].lastMessageReadAt = time;

        msgLogsDispatch({
          type: MESSAGE_LOGS_ACTIONS.updateLoaded,
          payload: updatedMsgLogs.content,
        });
      }
    });

    return () => socket.off('msg-on-read');
  }, [msgLogs]); //msg onread

  useEffect(() => {
    if (location.pathname === '/chats') {
      const search = Object.fromEntries(
        location.search
          .slice(1, location.search.length)
          .split('&')
          .map((q) => q.split('='))
      );

      // set the target recipient data
      setTarget({ targetId: search.id, chatType: search.type });

      // check if the url provided id and type of chat
      if (search.id && search.type) {
        if (Object.keys(activeChat).length === 0) {
          // assemble the new active chat state
          const newActiveChat = {
            _id: search.id,
            lastMessageReadAt: null,
            activeChat: true,
            initials: null,
            lastMessage: null,
            profilePicture: null,
            username: null,
          };

          // execute different code according to the search type
          switch (search.type) {
            case 'user':
              // get the last message for the active chat and set the message log to show chat history
              const { user, chat } = msgLogs.content[userState.user._id];

              if (user === search.id) {
                newActiveChat.lastMessage = chat[0] || null;

                chat.length > 0 && setMessageLog(chat);
              }

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
        //  else {
        //   //set the message log to show chat history
        //   const msgLog = msgLogs.content[search.id];
        //   if (!msgLog) return;

        //   msgLog.chat.length > 0 && setMessageLog(msgLog.chat);
        // }
      }
    }
  }, [location, msgLogs]); // to check if the url is directed to a certain chat

  useEffect(() => {
    socket.on('msg-sent', (isSent, info) => {
      if (!isSent) return;

      // start the update sequence
      msgLogsDispatch({ type: MESSAGE_LOGS_ACTIONS.startUpdate });
      const updatedMsgLogs = msgLogs;

      if (updatedMsgLogs.content[info.to]) {
        const chatContent = updatedMsgLogs.content[info.to].chat;

        // loop over the array of chats and find the one where the time sent matches, then update the isSent field into true
        for (const chat of chatContent) {
          if (chat.time === info.timeSent) {
            chat.isSent = true;
            break;
          }
        }

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

  useEffect(() => {
    if (!msgLogs?.content[activeChat._id]?.lastMessageReadAt) return;

    const timeMessageSent = new Date(
      msgLogs?.content[activeChat._id].lastMessageReadAt
    );

    const sentAt = getSentAtStatus(new Date(), timeMessageSent);

    switch (sentAt) {
      case 'today':
        const formattedTime = timeMessageSent
          .toTimeString()
          .slice(0, timeMessageSent.toTimeString().lastIndexOf(':'));

        return setTimeMessageRead(formattedTime);

      case 'yesterday':
        return setTimeMessageRead('a day ago');

      case 'long ago':
        return setTimeMessageRead(timeMessageSent.toLocaleDateString());
      default:
        break;
    }
  }, [msgLogs, activeChat]); //for determining the time sent

  const handleNewMessage = (e) => {
    e.preventDefault();
    if (newMessage === '') return;

    const newMessageInput = {
      by: userState.user._id,
      msgType: 'text',
      content: newMessage,
      isSent: false,
      time: new Date().toISOString(),
    };

    // update the message logs
    msgLogs.content[target.targetId]
      ? pushNewMsgToEntry(target.targetId, newMessageInput)
      : pushNewEntry(
          target.targetId,
          newMessageInput,
          sessionStorage.getItem('token'),
          activeChat._id
        );
    setTimeout(() => window.scrollTo({ top: window.scrollMaxY }), 150);

    // reset the input bar
    setnewMessage('');

    // send the message to the server
    // add a "to" field to the final object to indicate who the message is for
    newMessageInput.to = target.targetId;

    socket.emit('new-msg', newMessageInput, sessionStorage.getItem('token'));
  };

  const changeLocation = () => {
    const currentPath = location.pathname + location.search;
    const targetPath = `/chats?id=${activeChat._id}&type=user`;
    currentPath !== targetPath && navigate(targetPath);
  }; // will trigger when the input bar is clicked

  const handleGoToMenu = () => {
    setIsSidebarOn(!isSidebarOn);
    setActiveChat(ACTIVE_CHAT_DEFAULT);
  };

  return (
    <>
      <RenderIf conditionIs={!activeChat.username}>
        <StartScreen
          sidebarState={sidebarState}
          handleGoToMenu={handleGoToMenu}
        />
      </RenderIf>
      <RenderIf conditionIs={activeChat.username}>
        <main className="basis-full lg:basis-3/4 shadow-inner bg-gray-100 min-h-screen relative flex flex-col">
          <header className="h-14 sticky top-0 inset-x-0 z-10 bg-gray-50 shadow-inner p-2 border-b-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-3">
                {/* sidebar btn (will show up when screen is <lg) */}
                <button
                  onClick={handleGoToMenu}
                  className="block lg:hidden hover:text-pink-400 duration-200 text-xl pl-1"
                >
                  <HiOutlineMenu />
                </button>
                {/* profile  */}
                <Link
                  to={`user/${activeChat.username}`}
                  className="flex items-center gap-1"
                >
                  <img
                    src="https://picsum.photos/200/200"
                    alt=""
                    className="rounded-full h-8 w-8"
                  />
                  <div className="flex flex-col items-start">
                    <span className="text-xs max-w-[200px] truncate">
                      {activeChat.username}
                    </span>
                    <span className="text-xxs text-gray-500 relative z-10 max-w-[200px] truncate">
                      Status
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </header>
          <main className="max-w-screen-lg w-full mx-auto relative flex flex-col grow">
            {/* message */}
            <div ref={chatBoxRef} className="px-2 py-4 bg-gray-100 grow">
              {msgLogs?.content[activeChat._id]?.chat.map((log, i) => {
                return (
                  <Fragment key={i}>
                    <Message
                      state={{
                        isSent: log.isSent,
                        // isRead: log.isRead
                      }}
                      isSentByMe={log.by === userState.user._id}
                      msg={log.content}
                      time={new Date(log.time)}
                    />
                  </Fragment>
                );
              })}
              <RenderIf
                conditionIs={
                  msgLogs?.content[activeChat._id]?.lastMessageReadAt
                }
              >
                <div className="flex items-center justify-end mt-2 gap-x-1 font-bold text-xxs text-pink-400 animate-pop-in">
                  <BiCheckDouble className="text-lg" />
                  <span>Read at {timeMessageRead}</span>
                </div>
              </RenderIf>
            </div>
          </main>
          {/* input */}
          <form
            onSubmit={(e) => handleNewMessage(e)}
            className="bg-gray-100 sticky bottom-0 min-h-[1rem] flex items-center justify-center gap-3 
                        py-2 px-5"
          >
            <input
              type="text"
              onFocus={changeLocation}
              onChange={(e) => setnewMessage(e.target.value)}
              value={newMessage}
              className="bg-gray-200 pt-1.5 outline-none shadow focus:shadow-inner w-full
                         rounded-full px-6 resize-none flex items-center justify-center h-8 transition"
            />
            <RenderIf conditionIs={newMessage !== ''}>
              <button
                className="w-9 h-9 max-w-[36px] max-h-[36px] rounded-full bg-blue-300 
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
