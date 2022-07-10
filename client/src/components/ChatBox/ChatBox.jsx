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
import { ActiveChatContext } from '../../context/activeChat/ActiveChatContext';
import { MessageLogsContext } from '../../context/messageLogs/MessageLogsContext';
import MESSAGE_LOGS_ACTIONS from '../../context/messageLogs/messageLogsActions';

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
  const pushNewEntry = async (
    targetId,
    message,
    token,
    currentActiveChatId
  ) => {
    console.log('new');
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
    console.log('exist');
    const updatedMsgLogs = msgLogs;
    updatedMsgLogs.content[targetId].lastMessageReadAt = null;
    updatedMsgLogs.content[targetId].chat.push(message);

    msgLogsDispatch({
      type: MESSAGE_LOGS_ACTIONS.updateLoaded,
      payload: updatedMsgLogs.content,
    });
  };

  // scroll down to the bottom of the page when first loaded
  window.scrollTo({ top: window.scrollMaxY });

  /* RECIPIENT RELATED CODE */
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
    });

    return () => socket.off('receive-message');
  }, [msgLogs, userState]); // receiving message for recipient only code

  useEffect(() => {
    if (!activeChat._id) return;

    if (msgLogs.content[activeChat._id].chat.length > 0) {
      const currMsgLog = msgLogs.content[activeChat._id].chat;
      const finalMesIndex = msgLogs.content[activeChat._id].chat.length - 1;

      if (currMsgLog[finalMesIndex].by !== userState.user._id) {
        const token = sessionStorage.getItem('token');

        socket.emit(
          'read-msg',
          new Date().toISOString(),
          token,
          activeChat._id
        );
      }
    }
  }, [activeChat, msgLogs]); //set the message to read
  /* END RECIPIENT RELATED CODE */

  /* SENDER RELATED CODE */
  useEffect(() => {
    socket.on('msg-on-read', (isRead, recipientId) => {
      console.log('dsdsd');
    });

    return () => socket.off('msg-on-read');
  }, []);

  /* END OF SENDER RELATED CODE */

  /* MISC RELATED CODES */
  useEffect(() => {
    const targetId = activeChat._id;

    if (msgLogs.content[targetId]) {
      if (msgLogs.content[targetId].chat.length === 0) return;

      const logs = msgLogs.content[targetId];
      const i = logs.chat.length - 1; //index of last item in message log

      if (logs.chat[i].by === targetId) {
        window.scrollTo({ top: window.scrollMaxY });
      }
    }
  }, [msgLogs, userState]); // automatically scroll down to bottom

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
    if (!activeChat._id) return;
  }, [activeChat, userState]); // change the message log according to the active chat

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
      }
    });

    return () => socket.off('msg-sent');
  }, [msgLogs]); // for changing the message state indicator
  /* END OF MISC RELATED CODES */

  /* SENDING MESSAGES RELATED CODE */
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
    console.log(msgLogs.content[target.targetId]);

    msgLogs.content[target.targetId]
      ? pushNewMsgToEntry(target.targetId, newMessageInput)
      : pushNewEntry(
          target.targetId,
          newMessageInput,
          sessionStorage.getItem('token'),
          activeChat._id
        );

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
  /* END OF SENDING MESSAGES RELATED CODE */

  return (
    <>
      <RenderIf conditionIs={!activeChat.username}>
        <StartScreen sidebarState={sidebarState} />
      </RenderIf>
      <RenderIf conditionIs={activeChat.username}>
        <main className="basis-full lg:basis-3/4 shadow-inner bg-gray-100 min-h-screen relative flex flex-col">
          <header className="h-14 sticky top-0 inset-x-0 z-10 bg-gray-50 shadow-inner p-2 border-b-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-3">
                {/* sidebar btn (will show up when screen is <lg) */}
                <button
                  onClick={() => setIsSidebarOn(!isSidebarOn)}
                  className="block lg:hidden hover:text-pink-400 duration-200 text-xl"
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
            <div
              ref={chatBoxRef}
              className="px-2 py-4 space-y-5 bg-gray-100 grow"
            >
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
                <span>
                  Read at{' '}
                  {new Date(msgLogs?.content[activeChat._id]?.lastMessageRead)}
                </span>
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
