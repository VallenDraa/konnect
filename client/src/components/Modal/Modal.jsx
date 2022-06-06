import { useContext, useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import MODAL_ACTIONS from '../../context/Modal/modalActions';
import { ModalContext } from '../../context/Modal/modalContext';
import RenderIf from '../../utils/RenderIf';

export const Modal = () => {
  const { modalState, modalDispatch } = useContext(ModalContext);
  const modal = useRef();

  useEffect(() => {
    if (modalState.isActive) {
      document.body.style.overflowY = 'hidden';
    }
  }, [modalState]);

  const handleModalClose = () => {
    if (!modal.current) return;
    const modalClasses = modal.current.classList;

    modalClasses.replace('animate-pop-in', 'animate-pop-out');

    // only re-show scrollbar when the screen width is >=1024px
    if (window.innerWidth >= 1024) {
      document.body.style.overflowY = 'auto';
    }

    setTimeout(() => modalDispatch({ type: MODAL_ACTIONS.close }), 190);
  };

  return (
    <>
      <RenderIf conditionIs={modalState.isActive === true}>
        <div className="fixed z-30 inset-0 sm:bg-black/40 flex justify-center items-center">
          <div
            ref={modal}
            className="w-full h-full sm:h-3/4 sm:w-[30rem] bg-white relative flex flex-col p-4 rounded-md animate-pop-in"
          >
            <header className="basis-8 flex justify-between items-center px-1">
              <h1 className="font-semibold text-xl"></h1>
              <button
                className="text-xl p-2 hover:bg-slate-100 active:bg-slate-200 rounded-full aspect-square flex items-center justify-center duration-200"
                onClick={handleModalClose}
              >
                <IoClose />
              </button>
            </header>
          </div>
        </div>
      </RenderIf>
    </>
  );
};
