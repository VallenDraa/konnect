import { IoPersonAdd } from 'react-icons/io5';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { ImBlocked } from 'react-icons/im';
import generateRgb from '../../../../../../utils/generateRgb/generateRgb';
import RenderIf from '../../../../../../utils/React/RenderIf';
import PicturelessProfile from '../../../../../PicturelessProfile/PicturelessProfile';
import socket from '../../../../../../utils/socketClient/socketClient';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ContactNotif({ info, type }) {
  console.log(info);
  const handleResponse = (res) => {
    socket.emit('contact-requests-response', res);
  };

  const cancelRequest = () => {
    socket.emit('cancel-contact-request');
  };

  useEffect(() => {
    socket.on('recieve-contact-request-respond');
  }, []);

  return (
    <div
      className={`flex flex-col ${
        info.answer === true ? '' : 'items-center'
      } justify-between w-full`}
    >
      <span className="text-xxs text-slate-400 self-end">
        {new Date(info.iat).toLocaleDateString()}
      </span>
      {/* notif info*/}
      <div
        className={`flex ${
          info.answer === null ? 'flex-col' : ''
        } items-center gap-3`}
      >
        <aside>
          <Link to={`/user/${info.by.username}`}>
            <RenderIf conditionIs={!info.by.profilePicture}>
              <PicturelessProfile
                width={info.answer ? 40 : 50}
                initials={info.by.initials}
                bgColor={() => generateRgb(info.by.initials)}
              />
            </RenderIf>
          </Link>
        </aside>
        {/* the layout will be vertical if the request hasn't been answered yet */}
        <RenderIf conditionIs={info.answer === null}>
          <main className="flex flex-col items-center gap-y-1">
            <span className="text-2xl font-bold text-slate-800 max-w-[50%] truncate">
              {info.by.username}
            </span>
            <span className="text-lg md:text-sm text-slate-500 flex items-center">
              <IoPersonAdd className="mr-1" />
              {type === 'inbox'
                ? 'You recieved a contact request !'
                : 'A contact request has been sent !'}
            </span>
            <span className="text-sm md:text-xs text-slate-400">
              {new Date(info.iat).toLocaleDateString()}
            </span>
          </main>
        </RenderIf>
        <RenderIf conditionIs={info.answer === true}>
          <main className="flex flex-col items-center gap-y-1">
            <span className="text-slate-500 text-sm">
              <span className="font-bold text-slate-800">
                {info.by.username}
              </span>{' '}
              Has been added to your contacts list
            </span>
          </main>
        </RenderIf>
      </div>

      {/* response options will only render if request hasn't been answered yet */}
      <RenderIf info={info.answer === null}>
        <RenderIf conditionIs={type === 'inbox'}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleResponse(false)}
              className="aspect-video font-semibold text-xs flex items-center gap-x-1 py-1 px-2 shadow-md hover:shadow-sm active:shadow-inner bg-gray-200 rounded-md hover:bg-pink-400 active:bg-pink-500 hover:text-white duration-200"
            >
              <FaTimes />
              Reject
            </button>
            <button
              onClick={() => handleResponse(true)}
              className="aspect-video font-semibold text-xs flex items-center gap-x-1 py-1 px-2 shadow-md hover:shadow-sm active:shadow-inner bg-gray-200 rounded-md hover:bg-blue-400 active:bg-blue-500 hover:text-white duration-200"
            >
              <FaCheck />
              Accept
            </button>
          </div>
        </RenderIf>
        <RenderIf conditionIs={type === 'outbox'}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => cancelRequest()}
              className="aspect-video font-semibold text-xs flex items-center gap-x-1 py-1 px-2 shadow-md hover:shadow-sm active:shadow-inner bg-gray-200 rounded-md hover:bg-pink-400 active:bg-pink-500 hover:text-white duration-200"
            >
              <ImBlocked />
              Cancel
            </button>
          </div>
        </RenderIf>
      </RenderIf>
    </div>
  );
}
