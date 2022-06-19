import { ImFileVideo } from 'react-icons/im';
import { BsFileEarmarkImage } from 'react-icons/bs';
import { IoCall } from 'react-icons/io5';

export const ChatPreview = ({ chat, handleActiveChat }) => {
  return (
    <li
      onClick={() => handleActiveChat(chat)}
      className={`flex items-center p-2 cursor-pointer ${
        chat.activeChat ? 'bg-blue-100 font-semibold' : 'hover:bg-blue-100'
      } duration-200 rounded-md`}
    >
      <div className="flex items-center gap-2 basis-11/12">
        <img
          src="https://picsum.photos/200/200"
          alt=""
          className="rounded-full h-9 w-9"
        />
        <div className="flex flex-col gap-1">
          <span className="text-xs max-w-[200px] truncate">
            {chat.username}
          </span>
          <span className="text-xxs max-w-[200px] truncate text-gray-500 relative z-10 flex items-center gap-1">
            {chat.lastMessage.type === 'image' && (
              <>
                <BsFileEarmarkImage />
                {chat.lastMessage.content}
              </>
            )}
            {chat.lastMessage.type === 'video' && (
              <>
                <ImFileVideo />
                {chat.lastMessage.content}
              </>
            )}
            {chat.lastMessage.type === 'text' && chat.lastMessage.content}
            {chat.lastMessage.type === 'call' && (
              <>
                <IoCall />
                {chat.lastMessage.content}
              </>
            )}
          </span>
        </div>
      </div>

      <time className="text-xxs self-start basis-1/12">10:00</time>
    </li>
  );
};
