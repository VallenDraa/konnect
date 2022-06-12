import { useContext, useEffect, useRef } from 'react';
import { isInitialLoadingContext } from '../../context/isInitialLoading/isInitialLoading';

export const InitialLoadingScreen = () => {
  const { isInitialLoading, setIsInitialLoading } = useContext(
    isInitialLoadingContext
  );
  const loading = useRef();

  useEffect(() => {
    loading.current?.classList.add('animate-pop-out');
    setTimeout(() => setIsInitialLoading(false), 200);
  }, []);

  return (
    <>
      {isInitialLoading && (
        <div
          ref={loading}
          className="fixed inset-0 bg-white z-30 flex items-center justify-center"
        >
          Loading...
        </div>
      )}
    </>
  );
};
