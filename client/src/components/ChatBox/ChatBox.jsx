import { FaPaperPlane } from 'react-icons/fa';
import { HiOutlineMenu } from 'react-icons/hi';
import { MyMessage } from '../Message/MyMessage';
import { OtherMessage } from '../Message/OtherMessage';
import { StartScreen } from '../StartScreen/StartScreen';

export const ChatBox = ({ activeChat, sidebarState }) => {
  const { isSidebarOn, setIsSidebarOn } = sidebarState;
  const { username, lastMessage } = activeChat;

  if (!username || !lastMessage) {
    return <StartScreen sidebarState={sidebarState} />;
  }

  return (
    <main className="basis-full lg:basis-3/4 shadow-inner bg-gray-100 h-screen relative">
      <header className="h-14 bg-gray-50 absolute inset-x-0 z-10 shadow-inner p-2 border-b-2">
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
            <button className="flex items-center gap-1">
              <img
                src="https://picsum.photos/200/200"
                alt=""
                className="rounded-full h-8 w-8"
              />
              <div className="flex flex-col items-start">
                <span className="text-xs max-w-[200px] truncate">
                  {username}
                </span>
                <span className="text-xxs text-gray-500 relative z-10 max-w-[200px] truncate">
                  Status
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>
      <main className="h-full max-w-screen-xl w-full mx-auto max-w-screen relative pt-16">
        {/* message */}
        <div className="p-2 space-y-5">
          <MyMessage />
          <OtherMessage />
        </div>

        {/* input */}
        <form className="bg-gray-100 absolute bottom-0 inset-x-0 min-h-[1rem] flex items-center justify-center gap-3 p-2">
          <textarea className="bg-gray-200 pt-1.5 outline-none shadow focus:shadow-inner basis-11/12 rounded-full px-8 resize-none flex items-center justify-center h-9"></textarea>
          <button className="w-8 h-8 rounded-full bg-blue-300 hover:bg-blue-400 focus:bg-blue-400 focus:shadow-inner duration-200 flex items-center justify-center shadow">
            <FaPaperPlane className="relative right-[1px]" />
          </button>
        </form>
      </main>
    </main>
  );
};
