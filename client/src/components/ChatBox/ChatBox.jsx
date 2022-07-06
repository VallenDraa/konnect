import { useEffect, useState, Fragment, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaPaperPlane } from 'react-icons/fa';
import { HiOutlineMenu } from 'react-icons/hi';
import RenderIf from '../../utils/React/RenderIf';
import { MyMessage } from '../Message/MyMessage';
import { OtherMessage } from '../Message/OtherMessage';
import { StartScreen } from '../StartScreen/StartScreen';
import socket from '../../utils/socketClient/socketClient';
import { useContext } from 'react';
import { UserContext } from '../../context/user/userContext';
import getUsersPreview from '../../utils/apis/getusersPreview';

export const ChatBox = ({ activeChat, setActiveChat, sidebarState }) => {
  const chatBoxRef = useRef();
  const { userState } = useContext(UserContext);
  const { isSidebarOn, setIsSidebarOn } = sidebarState;
  const [messageLog, setMessageLog] = useState([]);
  const [newMessage, setnewMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [target, setTarget] = useState({ targetId: null, chatType: null }); //target id

  // scroll down to the bottom of the page when first loaded
  useEffect(() => window.scrollTo({ top: window.scrollMaxY }), []);

  // receiving message code
  useEffect(() => {
    socket.on('receive-message', (incomingMessage) => {
      const newMessageLog = [...messageLog, incomingMessage];
      setMessageLog(newMessageLog);
      console.log('msg received');
    });

    if (messageLog[messageLog.length - 1]?.by === userState.user._id) {
      window.scrollTo({ top: window.scrollMaxY });
    }

    return () => socket.off('receive-message');
  }, [messageLog]);

  // to check if the url is directed to a certain chat
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
              for (const { chat, user } of userState.user.contacts) {
                if (user === search.id) {
                  newActiveChat.lastMessage = chat[0] || null;

                  console.log(chat);
                  chat.length > 0 && setMessageLog(chat);
                }
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
        } else {
          //set the message log to show chat history
          for (const { chat, user } of userState.user.contacts) {
            if (user === search.id) chat.length > 0 && setMessageLog(chat);
          }
        }
      }
    }
  }, [location, userState]);

  const handleNewMessage = (e) => {
    e.preventDefault();
    if (newMessage === '') return;

    const newMessageInput = {
      by: userState.user._id,
      to: target.targetId,
      content: newMessage,
      msgType: 'text',
      time: new Date(),
    };
    const newMessageLog = [...messageLog, newMessageInput];

    setnewMessage('');
    setMessageLog(newMessageLog);
    socket.emit(
      'new-message',
      newMessageInput,
      sessionStorage.getItem('token')
    );
  };

  // will trigger when the input bar is clicked
  const changeLocation = () => {
    const currentPath = location.pathname + location.search;
    const targetPath = `/chats?id=${activeChat._id}&type=user`;
    currentPath !== targetPath && navigate(targetPath);
  };

  return (
    <>
      <RenderIf conditionIs={!activeChat.username}>
        <StartScreen sidebarState={sidebarState} />;
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
              {messageLog.map((log, i) => {
                return (
                  <Fragment key={i}>
                    <RenderIf conditionIs={log.by === userState.user._id}>
                      <MyMessage
                        msg={log.content}
                        time={new Date(log.time).toLocaleTimeString()}
                      />
                    </RenderIf>
                    <RenderIf conditionIs={log.by !== userState.user._id}>
                      <OtherMessage
                        msg={log.content}
                        time={new Date(log.time).toLocaleTimeString()}
                      />
                    </RenderIf>
                  </Fragment>
                );
              })}
            </div>
          </main>
          {/* input */}
          <form
            onSubmit={(e) => handleNewMessage(e)}
            className="bg-gray-100 sticky bottom-0 min-h-[1rem] flex items-center justify-center gap-3 py-2 px-5"
          >
            <input
              type="text"
              onFocus={changeLocation}
              onChange={(e) => setnewMessage(e.target.value)}
              value={newMessage}
              className="bg-gray-200 pt-1.5 outline-none shadow focus:shadow-inner w-full rounded-full px-6 resize-none flex items-center justify-center h-8 transition"
            />
            <RenderIf conditionIs={newMessage !== ''}>
              <button className="w-9 h-9 max-w-[36px] max-h-[36px] rounded-full bg-blue-300 hover:bg-blue-400 focus:bg-blue-400 focus:shadow-inner transition flex items-center justify-center shadow aspect-square text-xs animate-pop-in">
                <FaPaperPlane className="relative right-[1px]" />
              </button>
            </RenderIf>
          </form>
        </main>
      </RenderIf>
    </>
  );
};
