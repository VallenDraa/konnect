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

  const handleModalClose = () => {
    if (!modal.current || !modalWrapper.current) return;

    const modalClasses = modal.current.classList;
    const modalWrapperClasses = modalWrapper.current.classList;

    modalClasses.replace('animate-pop-in', 'animate-pop-out');
    modalWrapperClasses.replace('animate-fade-in', 'animate-fade-out');
    setTimeout(() => modalDispatch({ type: MODAL_ACTIONS.close }), 190);

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
          className={`fixed z-30 inset-0 flex justify-center items-center animate-fade-in
                    ${modalState.isActive ? 'md:bg-gray-900/40' : ''}
                    `}
        >
          <div
            ref={modal}
            className="h-full lg:h-3/4 lg:max-h-[800px] bg-white relative flex flex-col animate-pop-in z-100 lg:rounded-xl overflow-clip"
          >
            <header className="flex justify-between items-center px-4 py-3 h-16 relative">
              <h1 className="font-semibold left-1/2 -translate-x-1/2 absolute text-lg">
                {modalState.title}
              </h1>

              {/* close button */}
              <div className="grow flex items-center justify-end">
                <button
                  className="text-xl hover:text-blue-400 rounded-full duration-200 p-1 "
                  onClick={handleModalClose}
                >
                  <IoClose />
                </button>
              </div>
            </header>
            <main className="grow">{modalState.content}</main>
          </div>
        </div>
      </RenderIf>
    </>
  );
};
