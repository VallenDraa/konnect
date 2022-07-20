import { ImFileVideo } from 'react-icons/im';
import { BsFileEarmarkImage } from 'react-icons/bs';
import { IoCall } from 'react-icons/io5';
import { Link } from 'react-router-dom';

export const ChatPreview = ({
  user,
  lastMessage,
  handleActiveChat,
  timeSentArg,
  isActive,
}) => {
  if (!lastMessage || !timeSentArg) return;

  return (
    <li onClick={() => handleActiveChat(user)}>
      <Link
        to={isActive ? '/chats' : `/chats?id=${user._id}&type=user`}
        className={`flex items-center p-2 cursor-pointer duration-200 rounded-lg shadow
              ${
                isActive
                  ? 'bg-blue-100 font-semibold'
                  : 'hover:bg-pink-100 bg-gray-200'
              } `}
      >
        <div className="flex items-center gap-2 basis-11/12 overflow-hidden">
          <img
            src="https://picsum.photos/200/200"
            alt=""
            className="rounded-full h-12 w-12"
          />
          <div className="flex flex-col gap-1 overflow-hidden">
            <span className="truncate font-medium">{user.username}</span>
            <span className="text-sm truncate text-gray-500 relative z-10 flex items-center gap-1">
              {lastMessage.msgType === 'image' && (
                <>
                  <BsFileEarmarkImage />
                  {lastMessage.content}
                </>
              )}
              {lastMessage.msgType === 'video' && (
                <>
                  <ImFileVideo />
                  {lastMessage.content}
                </>
              )}
              {lastMessage.msgType === 'text' && lastMessage.content}
              {lastMessage.msgType === 'call' && (
                <>
                  <IoCall />
                  {lastMessage.content}
                </>
              )}
            </span>
          </div>
        </div>

        <time className="text-xxs self-start text-right basis-1/12 relative top-0.5">
          {timeSentArg}
        </time>
      </Link>
    </li>
  );
};
