import { useContext } from 'react';
import { IoPeopleSharp, IoCall, IoChatbubbles } from 'react-icons/io5';
import MODAL_ACTIONS from '../../context/Modal/modalActions';
import { ModalContext } from '../../context/Modal/modalContext';
import Pill from '../Buttons/Pill';

export default function CTA({ className = 'flex justify-evenly gap-2' }) {
  const { modalDispatch } = useContext(ModalContext);
  return (
    <div className={className}>
      <Pill
        onClick={() =>
          modalDispatch({ type: MODAL_ACTIONS.show, content: null })
        }
      >
        <IoCall />
        Start Call
      </Pill>
      <Pill
        onClick={() =>
          modalDispatch({ type: MODAL_ACTIONS.show, content: null })
        }
      >
        <IoChatbubbles />
        New Chat
      </Pill>
      <Pill
        onClick={() =>
          modalDispatch({ type: MODAL_ACTIONS.show, content: null })
        }
      >
        <IoPeopleSharp />
        New Group
      </Pill>
    </div>
  );
}
