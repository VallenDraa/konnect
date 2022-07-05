import { useContext, useEffect } from 'react';
import { IoPeopleSharp, IoCall, IoChatbubbles } from 'react-icons/io5';
import MODAL_ACTIONS from '../../context/modal/modalActions';
import { ModalContext } from '../../context/modal/modalContext';
import Pill from '../Buttons/Pill';
import NewChat from './contents/NewChat/NewChat';
import NewGroup from './contents/NewGroup/NewGroup';
import StartCall from './contents/StartCall/StartCall';
import { Link, useLocation } from 'react-router-dom';

export default function CTA({
  className = 'flex justify-evenly gap-2',
  urlHistory,
}) {
  const { modalState, modalDispatch } = useContext(ModalContext);
  const location = useLocation();

  useEffect(() => {
    const [route, subroute] = location.pathname.split('/').slice(1, 3);
    if (route !== 'new') return;

    const switchContent = (subroute) => {
      switch (subroute) {
        case 'chat':
          return <NewChat />;

        case 'call':
          return <StartCall />;

        case 'group':
          return <NewGroup />;

        default:
          break;
      }
    };

    // check if the useEffect is trying to render the same content twice
    if (
      JSON.stringify(modalState.content) ===
      JSON.stringify(switchContent(subroute))
    )
      return;

    modalDispatch({
      type: MODAL_ACTIONS.show,
      prevUrl: urlHistory?.current,
      onExitReturnToHome: false,
      content: switchContent(subroute),
    });
  }, [location]);

  return (
    <div className={className}>
      {/* message */}
      <Pill
        className="hover:bg-gray-200 active:bg-gray-300 max-w-[130px]"
        onClick={() =>
          modalDispatch({
            type: MODAL_ACTIONS.show,
            prevUrl: urlHistory?.current,
            onExitReturnToHome: false,
            content: <NewChat />,
          })
        }
      >
        <Link className="flex items-center gap-1" to="/new/chat">
          <IoChatbubbles />
          New Chat
        </Link>
      </Pill>

      {/* call */}
      <Pill
        className="hover:bg-gray-200 active:bg-gray-300 max-w-[130px]"
        onClick={() =>
          modalDispatch({
            type: MODAL_ACTIONS.show,
            prevUrl: urlHistory?.current,
            onExitReturnToHome: false,
            content: <StartCall />,
          })
        }
      >
        <Link className="flex items-center gap-1" to="/new/call">
          <IoCall />
          Start Call
        </Link>
      </Pill>

      {/* group */}
      <Pill
        className="hover:bg-gray-200 active:bg-gray-300 max-w-[130px]"
        onClick={() =>
          modalDispatch({
            type: MODAL_ACTIONS.show,
            prevUrl: urlHistory?.current,
            onExitReturnToHome: false,
            content: <NewGroup />,
          })
        }
      >
        <Link className="flex items-center gap-1" to="/new/group">
          <IoPeopleSharp />
          New Group
        </Link>
      </Pill>
    </div>
  );
}
