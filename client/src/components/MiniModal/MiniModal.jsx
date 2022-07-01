import { useRef } from 'react';
import { useEffect, useContext } from 'react';
import MINI_MODAL_ACTIONS from '../../context/miniModal/miniModalActions';
import { MiniModalContext } from '../../context/miniModal/miniModalContext';
import RenderIf from '../../utils/React/RenderIf';

export default function MiniModal({ children }) {
  const { miniModalState, miniModalDispatch } = useContext(MiniModalContext);
  const miniModalRef = useRef();
  const miniModalWrapperRef = useRef();

  // for playing closing animation
  useEffect(() => {
    if (!miniModalState.isClosing) return;

    miniModalRef.current?.classList.replace(
      'animate-pop-in',
      'animate-pop-out'
    );
    miniModalWrapperRef.current?.classList.replace(
      'animate-fade-in',
      'animate-fade-out'
    );

    setTimeout(
      () => miniModalDispatch({ type: MINI_MODAL_ACTIONS.close }),
      190
    );
  }, [miniModalState]);

  return (
    <RenderIf conditionIs={miniModalState.isActive}>
      <div
        ref={miniModalWrapperRef}
        className="fixed bg-black/30 inset-0 flex items-center justify-center z-40 animate-fade-in"
      >
        <div
          ref={miniModalRef}
          className="min-h-[200px] w-screen sm:w-[600px] bg-white shadow-xl rounded-xl flex flex-col mx-5 animate-pop-in"
        >
          {miniModalState.content}
        </div>
      </div>
    </RenderIf>
  );
}
