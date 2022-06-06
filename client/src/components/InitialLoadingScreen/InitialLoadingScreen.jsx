import { useEffect, useRef, useState } from 'react';

export const InitialLoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const loading = useRef();
  useEffect(() => {
    setTimeout(() => loading.current.classList.add('animate-pop-out'), 500);
    setTimeout(() => setIsLoading(false), 650);
  }, [loading]);

  return (
    <>
      {isLoading && (
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
