import { FaCheck, FaTimes } from 'react-icons/fa';
import { ImBlocked } from 'react-icons/im';
import { Link } from 'react-router-dom';
import { UserContext } from '../../../../../../context/user/userContext';
import { useContext } from 'react';
import { ContactsContext } from '../../../../../../context/contactContext/contactContext';
import generateRgb from '../../../../../../utils/generateRgb/generateRgb';
import RenderIf from '../../../../../../utils/React/RenderIf';
import PicturelessProfile from '../../../../../PicturelessProfile/PicturelessProfile';
import socket from '../../../../../../utils/socketClient/socketClient';

export default function ContactNotif({ info, type }) {
  // console.log(info, type);
  const { userState } = useContext(UserContext);
  const { contacts, setContacts } = useContext(ContactsContext);

  const handleResponse = (answer, type) => {
    if (type === 'inbox') {
      const payload = {
        answer,
        token: sessionStorage.getItem('token'),
        senderId: info.by?._id,
        recipientId: userState.user._id,
      };
      socket.emit('contact-requests-response', payload);
    }
  };

  const cancelRequest = () => {
    const payload = {
      token: sessionStorage.getItem('token'),
      senderId: userState.user._id,
      recipientId: info.by?._id,
    };

    socket.emit('cancel-add-contact', payload);
  };

  return (
    <div className={`flex flex-col gap-1 justify-between w-full`}>
      <header className="flex justify-between mb-5">
        <span className="text-xxs text-gray-400 font-extrabold self-end">
          CONTACT REQUEST
        </span>
        <span className="text-xxs text-gray-400 self-end">
          {new Date(info.iat).toLocaleDateString()}
        </span>
      </header>
      {/* notif info*/}
      <main className={`flex items-center gap-3`}>
        <aside>
          <Link
            title={`Go to ${info.by?.username}'s profile`}
            to={`/user/${info.by?.username}`}
          >
            <RenderIf conditionIs={!info.by?.profilePicture}>
              <PicturelessProfile
                width={info.answer !== null ? 40 : 50}
                initials={info.by?.initials}
                bgColor={() => generateRgb(info.by?.initials)}
              />
            </RenderIf>
          </Link>
        </aside>

        <main className="flex flex-col items-center gap-y-1">
          <span className="text-slate-500 text-sm">
            <RenderIf conditionIs={info.answer === null}>
              <RenderIf conditionIs={type === 'inbox'}>
                <span className="font-bold text-slate-800">
                  {info.by?.username}
                </span>{' '}
                has sent you a contact request !
              </RenderIf>
              <RenderIf conditionIs={type === 'outbox'}>
                A contact request has been sent to{' '}
                <span className="font-bold text-slate-800">
                  {info.by?.username}
                </span>
              </RenderIf>
            </RenderIf>

            <RenderIf conditionIs={info.answer !== null}>
              <span className="font-bold text-slate-800">
                {info.by?.username}
              </span>{' '}
              <RenderIf conditionIs={info.answer === true}>
                Has been added to your contacts list.
              </RenderIf>
              <RenderIf conditionIs={info.answer === false}>
                Rejected your contact request.
              </RenderIf>
            </RenderIf>
          </span>
        </main>
      </main>

      {/* response options will only render if request hasn't been answered yet */}
      <RenderIf conditionIs={info.answer === null}>
        <RenderIf conditionIs={type === 'inbox'}>
          <footer className="flex items-center gap-2 mt-2 self-end">
            <button
              onClick={() => handleResponse(false, type)}
              className="font-semibold text-xs flex items-center gap-x-1 py-2 px-4 shadow-md hover:shadow-sm active:shadow-inner active:shadow-pink-600 bg-gray-200 rounded-md hover:bg-pink-400 active:bg-pink-500 hover:text-white duration-200"
            >
              <FaTimes />
              Reject
            </button>
            <button
              onClick={() => handleResponse(true, type)}
              className="font-semibold text-xs flex items-center gap-x-1 py-2 px-4 shadow-md hover:shadow-sm active:shadow-inner active:shadow-blue-600 bg-gray-200 rounded-md hover:bg-blue-400 active:bg-blue-500 hover:text-white duration-200"
            >
              <FaCheck />
              Accept
            </button>
          </footer>
        </RenderIf>
        <RenderIf conditionIs={type === 'outbox'}>
          <div className="flex items-center gap-2 self-end">
            <button
              onClick={cancelRequest}
              className="font-semibold text-xs flex items-center gap-x-1  py-2 px-4 shadow-md hover:shadow-sm active:shadow-inner bg-gray-200 rounded-md hover:bg-pink-400 active:bg-pink-500 hover:text-white duration-200"
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
