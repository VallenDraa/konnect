import { useContext, useEffect, useRef } from "react";
import { IsAuthorizedContext } from "../../context/isAuthorized/isAuthorized";
import { isInitialLoadingContext } from "../../context/isInitialLoading/isInitialLoading";
import { SettingsContext } from "../../context/settingsContext/SettingsContext";
import RenderIf from "../../utils/React/RenderIf";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

export const InitialLoadingScreen = () => {
  const { isInitialLoading, setIsInitialLoading } = useContext(
    isInitialLoadingContext
  );
  const loading = useRef();
  const isAuthorized = useContext(IsAuthorizedContext);
  const { settings } = useContext(SettingsContext);

  // remove initial loading screen when user is authorized
  useEffect(() => {
    if (!loading.current) return;
    if (isAuthorized) {
      if (settings.general?.animation) {
        const animDelay = window.innerWidth <= 1024 ? 300 : 0;

        // delay the fading animation if window screen size is small
        setTimeout(() => {
          loading.current.classList.add("animate-pop-out");
          setTimeout(() => setIsInitialLoading(false), 190);
        }, animDelay);
      } else {
        setIsInitialLoading(false);
      }
    }
  }, [loading, isAuthorized]);
  return (
    <RenderIf conditionIs={isInitialLoading}>
      <div
        ref={loading}
        className="bg-tile fixed inset-0 bg-white z-40 flex items-center justify-center"
      >
        <LoadingSpinner />
      </div>
    </RenderIf>
  );
};
