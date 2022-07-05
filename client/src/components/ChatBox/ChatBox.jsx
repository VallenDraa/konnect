import { useEffect, useState, Fragment, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaPaperPlane } from 'react-icons/fa';
import { HiOutlineMenu } from 'react-icons/hi';
import RenderIf from '../../utils/React/RenderIf';
import { MyMessage } from '../Message/MyMessage';
import { OtherMessage } from '../Message/OtherMessage';
import { StartScreen } from '../StartScreen/StartScreen';
import socket from '../../utils/socketClient/socketClient';

export const ChatBox = ({ activeChat, sidebarState }) => {
  const chatBoxRef = useRef();
  const { isSidebarOn, setIsSidebarOn } = sidebarState;
  const [messageLog, setMessageLog] = useState([]);
  const [newMessage, setnewMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    socket.on('receive-message', (incomingMessage) => {
      const newMessageLog = [...messageLog, incomingMessage];
      setMessageLog(newMessageLog);
      window.scrollTo({ top: window.scrollMaxY });
    });
  }, [messageLog]);

  useEffect(() => {
    if (location.pathname === '/chats') {
      const search = Object.fromEntries(
        location.search
          .slice(1, location.search.length)
          .split('&')
          .map((q) => q.split('='))
      );

      if (search.id && search.type) {
        if (Object.keys(activeChat) !== 0) {
          console.log('empty chat');
        }
      }
    }
  }, [location]);

  const handleNewMessage = (e) => {
    e.preventDefault();
    if (messageLog !== '') {
      setnewMessage('');
      const newMessageInput = {
        by: socket.id,
        message: newMessage,
        time: new Date(),
      };
      const newMessageLog = [...messageLog, newMessageInput];

      setMessageLog(newMessageLog);
      socket.emit('new-message', newMessageInput);
      window.scrollTo({ top: window.scrollMaxY });
    }
  };

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
          <main className="max-w-screen-xl w-full mx-auto relative flex flex-col grow">
            {/* message */}
            <div
              ref={chatBoxRef}
              className="px-2 py-4 space-y-5 bg-gray-100 grow"
            >
              {messageLog.map((log, i) => {
                return (
                  <Fragment key={i}>
                    <RenderIf conditionIs={log.by === socket.id}>
                      <MyMessage
                        msg={log.message}
                        time={new Date(log.time).toLocaleTimeString()}
                      />
                    </RenderIf>
                    <RenderIf conditionIs={log.by !== socket.id}>
                      <OtherMessage
                        msg={log.message}
                        time={new Date(log.time).toLocaleTimeString()}
                      />
                    </RenderIf>
                  </Fragment>
                );
              })}
            </div>

            {/* input */}
            <form
              onSubmit={(e) => handleNewMessage(e)}
              className="bg-gray-100 sticky bottom-0 inset-x-0 min-h-[1rem] flex items-center justify-center gap-3 p-2"
            >
              <input
                type="text"
                onFocus={changeLocation}
                onChange={(e) => setnewMessage(e.target.value)}
                value={newMessage}
                className="bg-gray-200 pt-1.5 outline-none shadow focus:shadow-inner w-full rounded-full px-6 resize-none flex items-center justify-center h-8"
              />
              <button className="w-9 h-9 max-w-[36px] max-h-[36px] rounded-full bg-blue-300 hover:bg-blue-400 focus:bg-blue-400 focus:shadow-inner duration-200 flex items-center justify-center shadow aspect-square text-xs">
                <FaPaperPlane className="relative right-[1px]" />
              </button>
            </form>
          </main>
        </main>
      </RenderIf>
    </>
  );
};
