import { useRef } from "react";
import { useEffect, useContext } from "react";
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
        className={`fixed bg-black/30 inset-0 flex items-center justify-center z-40 
                  ${general?.animation ? "animate-fade-in" : ""}`}
      >
        <div
          ref={miniModalRef}
          className={`min-h-[350px] min-w-[350px] bg-white shadow-xl rounded-xl flex flex-col mx-5
                    ${general?.animation ? "animate-pop-in" : ""}`}
        >
          {miniModalState.content}
        </div>
      </div>
    </RenderIf>
  );
}
