import { useContext, useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import MODAL_ACTIONS from '../../context/Modal/modalActions';
import { ModalContext } from '../../context/Modal/modalContext';
import RenderIf from '../../utils/RenderIf';

export const Modal = () => {
  const { modalState, modalDispatch } = useContext(ModalContext);
  const modal = useRef();
  const modalWrapper = useRef();

  useEffect(() => {
    if (modalState.isActive) {
      document.body.style.overflowY = 'hidden';
    }
  }, [modalState]);

  const handleModalClose = () => {
    if (!modal.current || !modalWrapper.current) return;
    const modalClasses = modal.current.classList;
    const modalWrapperClasses = modalWrapper.current.classList;

    modalClasses.replace('animate-pop-in', 'animate-pop-out');
    modalWrapperClasses.replace('animate-fade-in', 'animate-fade-out');

    // only re-show scrollbar when the screen width is >=1024px
    if (window.innerWidth >= 1024) {
      document.body.style.overflowY = 'auto';
    }

    setTimeout(() => modalDispatch({ type: MODAL_ACTIONS.close }), 190);
  };

  return (
    <>
      <RenderIf conditionIs={modalState.isActive === true}>
        <div
          ref={modalWrapper}
          className="fixed z-30 inset-0 sm:bg-gray-900/40 flex justify-center items-center animate-fade-in"
        >
          <div
            ref={modal}
            className="h-full md:h-3/4 bg-white relative flex flex-col animate-pop-in z-100"
          >
            <header className="flex justify-end items-center px-4 py-3">
              <button
                className="text-xl hover:text-pink-400  rounded-full flex items-center justify-center duration-200"
                onClick={handleModalClose}
              >
                <IoClose />
              </button>
            </header>
            <main className="grow">{modalState.content}</main>
          </div>
        </div>
      </RenderIf>
    </>
  );
};
