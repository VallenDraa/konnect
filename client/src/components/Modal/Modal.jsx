import { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import MODAL_ACTIONS from '../../context/modal/modalActions';
import { ModalContext } from '../../context/modal/modalContext';
import RenderIf from '../../utils/React/RenderIf';

export const Modal = () => {
  const { modalState, modalDispatch } = useContext(ModalContext);
  const modal = useRef();
  const modalWrapper = useRef();
  const navigate = useNavigate();

  // hides scrollbar when modal is active
  useEffect(() => {
    if (modalState.isActive) document.body.style.overflowY = 'hidden';
  }, [modalState]);

  const handleModalClose = () => {
    if (!modal.current || !modalWrapper.current) return;

    const modalClasses = modal.current.classList;
    const modalWrapperClasses = modalWrapper.current.classList;

    modalClasses.replace('animate-pop-in', 'animate-pop-out');
    modalWrapperClasses.replace('animate-fade-in', 'animate-fade-out');
    setTimeout(() => modalDispatch({ type: MODAL_ACTIONS.close }), 190);

    // only re-show screen scrollbar when the screen width is >=1024px
    if (window.innerWidth >= 1024) document.body.style.overflowY = 'auto';

    // go back to '/chats' path if the onExitReturnToHome in the modal context is true
    modalState.onExitReturnToHome && navigate('/chats');

    // go back to previous url path if the `prevUrl is provided
    modalState.prevUrl && navigate(modalState.prevUrl);
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
            className="h-full md:h-3/4 md:max-h-[800px] md:aspect-square bg-white relative flex flex-col animate-pop-in z-100"
          >
            <header className="flex justify-end items-center px-4 py-3">
              {/* close button */}
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
