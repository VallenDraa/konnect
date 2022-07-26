import { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import MODAL_ACTIONS from "../../context/modal/modalActions";
import { ModalContext } from "../../context/modal/modalContext";
import RenderIf from "../../utils/React/RenderIf";
import { UrlHistoryContext } from "../../pages/Home/Home";
import { SettingsContext } from "../../context/settingsContext/SettingsContext";

export const Modal = () => {
  const { modalState, modalDispatch } = useContext(ModalContext);
  const modal = useRef();
  const modalWrapper = useRef();
  const navigate = useNavigate();
  const lastNonModalUrl = useRef("/chats");
  const urlHistory = useContext(UrlHistoryContext);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  useEffect(() => {
    if (!urlHistory.current) return;

    const isNonModalUrl =
      urlHistory.current.includes("chats") ||
      urlHistory.current.includes("contacts") ||
      urlHistory.current.includes("search") ||
      urlHistory.current.includes("notifications");

    if (isNonModalUrl) {
      lastNonModalUrl.current = urlHistory.current;
    }
  }, [urlHistory]);

  const handleModalClose = () => {
    if (!modal.current || !modalWrapper.current) return;

    const modalClasses = modal.current.classList;
    const modalWrapperClasses = modalWrapper.current.classList;

    if (general?.animation) {
      modalClasses.replace("animate-pop-in", "animate-pop-out");
      modalWrapperClasses.replace("animate-fade-in", "animate-fade-out");
      setTimeout(() => modalDispatch({ type: MODAL_ACTIONS.close }), 190);
    } else {
      modalDispatch({ type: MODAL_ACTIONS.close });
    }

    // go back to '/chats' path if the onExitReturnToHome in the modal context is true
    modalState.onExitReturnToHome && navigate("/chats");

    // go back to previous url path if the `prevUrl is provided and is not another modal path
    if (modalState.prevUrl) {
      const url = modalState.prevUrl;
      const isNonModalUrl =
        url.includes("chats") ||
        url.includes("contacts") ||
        url.includes("search") ||
        url.includes("notifications");

      isNonModalUrl
        ? navigate(modalState.prevUrl)
        : navigate(lastNonModalUrl.current);
    }
  };

  return (
    <>
      <RenderIf conditionIs={modalState.isActive === true}>
        <div
          ref={modalWrapper}
          className={`fixed z-30 inset-0 flex justify-center items-center 
                    ${modalState.isActive ? "lg:bg-gray-900/40" : "bg-gray-100"}
                    ${general?.animation ? "animate-fade-in" : ""}`}
        >
          <div
            ref={modal}
            className={`h-full lg:h-3/4 lg:max-h-[800px] relative flex flex-col z-100 lg:rounded-xl overflow-clip bg-gray-100
                      ${general?.animation ? "animate-pop-in" : ""}`}
          >
            <header className="px-4 pt-3 h-14 container max-w-screen-sm mx-auto bg-white">
              <div className="flex justify-between relative">
                <h1 className="font-semibold left-1/2 -translate-x-1/2 absolute text-lg">
                  {modalState.title}
                </h1>

                {/* close button */}
                <div className="grow flex items-center justify-end">
                  <button
                    className={`text-xl hover:text-blue-400 rounded-full p-1 ${
                      general?.animation ? "duration-200" : ""
                    }`}
                    onClick={handleModalClose}
                  >
                    <IoClose />
                  </button>
                </div>
              </div>
            </header>
            <main className="grow">{modalState.content}</main>
          </div>
        </div>
      </RenderIf>
    </>
  );
};
