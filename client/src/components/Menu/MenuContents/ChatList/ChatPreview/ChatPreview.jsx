import { ImFileVideo } from 'react-icons/im';
import { BsFileEarmarkImage } from 'react-icons/bs';
import { IoCall } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const ChatPreview = ({
  user,
  lastMessage,
  handleActiveChat,
  isActive,
}) => {
  if (!lastMessage) return;
  const [timeSent, setTimeSent] = useState(null);

  // will run to determine the time the message was sent
  useEffect(() => {
    let sentAt;
    const now = new Date();
    const timeMessageSent = new Date(lastMessage.time);
    const todaysDate = now.getDate();
    const messageSentDate = timeMessageSent.getDate();
    const todaysMonthAndYear = `${now.getMonth()}/${now.getFullYear()}`;
    const messageSentDateMonthAndYear = `${timeMessageSent.getMonth()}/${timeMessageSent.getFullYear()}`;

    // determine the time at which the message was sent
    if (todaysDate === messageSentDate) {
      sentAt = 'today';
    } else if (
      todaysDate > messageSentDate &&
      todaysDate - messageSentDate === 1 &&
      todaysMonthAndYear === messageSentDateMonthAndYear
    ) {
      sentAt = 'yesterday';
    } else {
      sentAt = 'long ago';
    }

    // determine the time indicator that'll be displayed
    switch (sentAt) {
      case 'today':
        const formattedTime = timeMessageSent
          .toTimeString()
          .slice(0, timeMessageSent.toTimeString().lastIndexOf(':'));

        return setTimeSent(formattedTime);

      case 'yesterday':
        return setTimeSent('Yesterday');

      case 'long ago':
        return setTimeSent(timeMessageSent.toLocaleDateString());
      default:
        break;
    }
  }, [user]);

  return (
    <li onClick={() => handleActiveChat(user)}>
      <Link
        to={`/chats?id=${user._id}&type=user`}
        className={`flex items-center p-2 cursor-pointer duration-200 rounded-md
              ${isActive ? 'bg-blue-100 font-semibold' : 'hover:bg-blue-100'} `}
      >
        <div className="flex items-center gap-2 basis-11/12">
          <img
            src="https://picsum.photos/200/200"
            alt=""
            className="rounded-full h-9 w-9"
          />
          <div className="flex flex-col gap-1">
            <span className="text-xs max-w-[200px] truncate">
              {user.username}
            </span>
            <span className="text-xxs max-w-[200px] truncate text-gray-500 relative z-10 flex items-center gap-1">
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

        <time className="text-xxs self-start basis-1/12">{timeSent}</time>
      </Link>
    </li>
  );
};
