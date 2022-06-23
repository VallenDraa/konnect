import { IoPersonAdd } from 'react-icons/io5';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { ImBlocked } from 'react-icons/im';
import generateRgb from '../../../../../../utils/generateRgb/generateRgb';
import RenderIf from '../../../../../../utils/React/RenderIf';
import PicturelessProfile from '../../../../../PicturelessProfile/PicturelessProfile';
import socket from '../../../../../../utils/socketClient/socketClient';
import { useEffect } from 'react';

export default function ContactNotif({ by, iat, type }) {
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
    <div className="flex flex-col items-center justify-between gap-3 w-full">
      {/* notif info*/}
      <div className="flex flex-col items-center gap-3">
        <aside>
          <RenderIf conditionIs={!by.profilePicture}>
            <PicturelessProfile
              width={50}
              initials={by.initials}
              bgColor={() => generateRgb(by.initials)}
            />
          </RenderIf>
        </aside>
        <main className="flex flex-col items-center gap-y-1">
          <span className="text-2xl font-bold text-slate-800 max-w-[50%] truncate">
            {by.username}
          </span>
          <span className="text-lg md:text-sm text-slate-500 flex items-center">
            <IoPersonAdd className="mr-1" />
            {type === 'inbox'
              ? 'You recieved a contact request !'
              : 'A contact request has been sent !'}
          </span>
          <span className="text-sm md:text-xs text-slate-400">
            {new Date(iat).toLocaleDateString()}
          </span>
        </main>
      </div>

      {/* response */}
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
    </div>
  );
}
