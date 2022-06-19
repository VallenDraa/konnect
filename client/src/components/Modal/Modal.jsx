import { useContext, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import MODAL_ACTIONS from '../../context/modal/modalActions';
import { ModalContext } from '../../context/modal/modalContext';
import RenderIf from '../../utils/RenderIf';
import { useState } from 'react';

export const Modal = () => {
  const { modalState, modalDispatch } = useContext(ModalContext);
  const modal = useRef();
  const modalWrapper = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  // const [contentExists, setContentExists] = useState({});

  // hides scrollbar when modal is active
  useEffect(() => {
    if (modalState.isActive) {
      document.body.style.overflowY = 'hidden';
    }
  }, [modalState]);

  // insert paths that contains modal
  // useEffect(() => {
  //   console.log(modalState.isActive);
  //   if (!modalState.isActive) return;
  //   if (location.pathname in contentExists) return;
  //   console.log({ [location.pathname]: location.pathname });

  //   setContentExists({
  //     [location.pathname]: location.pathname,
  //     ...contentExists,
  //   });

  //   console.log(contentExists);
  // }, [location]);

  // close modal when the path changes
  useEffect(() => {
    if (!modal.current || !modalWrapper.current) return;

    const modalClasses = modal.current.classList;
    const modalWrapperClasses = modalWrapper.current.classList;

    const { pathname, isActive } = modalState;

    if (location.pathname !== pathname && isActive) {
      // if (location.pathname in contentExists) return;

      modalClasses.replace('animate-pop-in', 'animate-pop-out');
      modalWrapperClasses.replace('animate-fade-in', 'animate-fade-out');
      setTimeout(() => modalDispatch({ type: MODAL_ACTIONS.close }), 190);
    }
  }, [location]);

  const handleModalClose = () => {
    if (!modal.current || !modalWrapper.current) return;

    const modalClasses = modal.current.classList;
    const modalWrapperClasses = modalWrapper.current.classList;

    modalClasses.replace('animate-pop-in', 'animate-pop-out');
    modalWrapperClasses.replace('animate-fade-in', 'animate-fade-out');

    setTimeout(() => modalDispatch({ type: MODAL_ACTIONS.close }), 190);

    // only re-show screen scrollbar when the screen width is >=1024px
    if (window.innerWidth >= 1024) {
      document.body.style.overflowY = 'auto';
    }

    // go back to '/' path if the onExitReturnToHome in the modal context is true
    modalState.onExitReturnToHome && navigate('/');
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
