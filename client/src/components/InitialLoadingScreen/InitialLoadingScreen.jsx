import { useContext, useEffect, useRef } from 'react';
import { IsAuthorizedContext } from '../../context/isAuthorized/isAuthorized';
import { isInitialLoadingContext } from '../../context/isInitialLoading/isInitialLoading';
import RenderIf from '../../utils/React/RenderIf';

export const InitialLoadingScreen = () => {
  const { isInitialLoading, setIsInitialLoading } = useContext(
    isInitialLoadingContext
  );
  const loading = useRef();
  const isAuthorized = useContext(IsAuthorizedContext);

  // remove initial loading screen when user is authorized
  useEffect(() => {
    if (!loading.current) return;
    if (isAuthorized) {
      loading.current.classList.add('animate-pop-out');
      setTimeout(() => setIsInitialLoading(false), 190);
    }
  }, [loading, isAuthorized]);

  return (
    <RenderIf conditionIs={isInitialLoading}>
      <div
        ref={loading}
        className="fixed inset-0 bg-white z-30 flex items-center justify-center"
      >
        Loading...
      </div>
    </RenderIf>
  );
};
