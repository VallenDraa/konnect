import { useContext, useEffect, useRef, useState } from 'react';
import { isInitialLoadingContext } from '../../context/isInitialLoading/IsInitialLoading';
import socket from '../../socketClient/socketClient';

export const InitialLoadingScreen = () => {
  const { isInitialLoading, setIsInitialLoading } = useContext(
    isInitialLoadingContext
  );
  const loading = useRef();

  useEffect(() => {
    socket.on('connect', () => {
      loading.current?.classList.add('animate-pop-out');
      setTimeout(() => setIsInitialLoading(false), 200);
    });
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
