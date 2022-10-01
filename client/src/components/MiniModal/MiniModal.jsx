import { useRef } from "react";
import { useEffect, useContext } from "react";
import { IoClose } from "react-icons/io5";
import MINI_MODAL_ACTIONS from "../../context/miniModal/miniModalActions";
import { MiniModalContext } from "../../context/miniModal/miniModalContext";
import { SettingsContext } from "../../context/settingsContext/SettingsContext";
import RenderIf from "../../utils/React/RenderIf";

export default function MiniModal() {
  const { miniModalState, miniModalDispatch } = useContext(MiniModalContext);
  const miniModalRef = useRef();
  const miniModalWrapperRef = useRef();
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  // for playing closing animation
  useEffect(() => {
    if (!miniModalState.isClosing) return;

    if (general?.animation) {
      miniModalRef.current?.classList.replace(
        "animate-pop-in",
        "animate-pop-out"
      );
      miniModalWrapperRef.current?.classList.replace(
        "animate-fade-in",
        "animate-fade-out"
      );

      setTimeout(
        () => miniModalDispatch({ type: MINI_MODAL_ACTIONS.close }),
        190
      );
    } else {
      miniModalDispatch({ type: MINI_MODAL_ACTIONS.close });
    }
  }, [miniModalState, general]);

  return (
    <RenderIf conditionIs={miniModalState.isActive}>
      <div
        ref={miniModalWrapperRef}
        className={`fixed bg-black/30 inset-0 flex items-center justify-center z-50 ${
          general?.animation ? "animate-fade-in" : ""
        }`}
      >
        <div
          ref={miniModalRef}
          className={`min-w-full sm:min-w-[350px] bg-white shadow-xl rounded-xl overflow-clip flex flex-col mx-5 ${
            general?.animation ? "animate-pop-in" : ""
          }`}
        >
          {/* header for title and close button */}
          <header className="container max-w-screen-sm mx-auto">
            <RenderIf
              conditionIs={miniModalState.title || miniModalState.closeButton}
            >
              <div className="px-4 pt-3 flex justify-between relative">
                <RenderIf conditionIs={miniModalState.title}>
                  <h1 className="font-semibold left-1/2 -translate-x-1/2 absolute text-lg">
                    {miniModalState.title}
                  </h1>
                </RenderIf>

                <RenderIf conditionIs={miniModalState.closeButton}>
                  {/* close button */}
                  <div className="grow flex items-center justify-end">
                    <button
                      onClick={() =>
                        miniModalDispatch({ type: MINI_MODAL_ACTIONS.closing })
                      }
                      className={`text-xl hover:text-blue-400 rounded-full p-1 ${
                        general?.animation ? "duration-200" : ""
                      }`}
                    >
                      <IoClose />
                    </button>
                  </div>
                </RenderIf>
              </div>
            </RenderIf>
          </header>
          {miniModalState.content}
        </div>
      </div>
    </RenderIf>
  );
}
