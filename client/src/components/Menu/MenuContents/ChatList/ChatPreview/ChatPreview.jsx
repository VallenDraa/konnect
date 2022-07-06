import { ImFileVideo } from 'react-icons/im';
import { BsFileEarmarkImage } from 'react-icons/bs';
import { IoCall } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const ChatPreview = ({ chat, handleActiveChat }) => {
  const { timeSent, setTimeSent } = useState();

  // will run to determine the time the message was sent
  useEffect(() => {
    let sentAt;

    // check if it is sent today
    if (
      new Date().toLocaleDateString() ===
      new Date(chat.lastMessage.time).toLocaleDateString()
    ) {
      sentAt = 'today';
    } else {
    }
  }, []);
  const LAST_INDEX_OF_COLON = 4;
  const time = new Date(chat.lastMessage.time)
    .toLocaleTimeString()
    .slice(0, LAST_INDEX_OF_COLON);

  console.log(
    new Date().toLocaleDateString() ===
      new Date(chat.lastMessage.time).toLocaleDateString()
  );
  return (
    <li onClick={() => handleActiveChat(chat)}>
      <Link
        to={`/chats?id=${chat._id}&type=user`}
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
              {chat.lastMessage.msgType === 'image' && (
                <>
                  <BsFileEarmarkImage />
                  {chat.lastMessage.content}
                </>
              )}
              {chat.lastMessage.msgType === 'video' && (
                <>
                  <ImFileVideo />
                  {chat.lastMessage.content}
                </>
              )}
              {chat.lastMessage.msgType === 'text' && chat.lastMessage.content}
              {chat.lastMessage.msgType === 'call' && (
                <>
                  <IoCall />
                  {chat.lastMessage.content}
                </>
              )}
            </span>
          </div>
        </div>

        <time className="text-xxs self-start basis-1/12">{time}</time>
      </Link>
    </li>
  );
};
