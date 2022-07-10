import { useEffect, createContext, useState } from 'react';
import socket from '../../utils/socketClient/socketClient';

export const IsAuthorizedContext = createContext(false);

export default function IsAuthorizedContextProvider({ children }) {
  const [isAuthorized, setisAuthorized] = useState(false);

  useEffect(() => {
    socket.on('is-authorized', ({ authorized }) => {
      setisAuthorized(authorized);
    });

    return () => socket.off('is-authorized');
  });

  return (
    <IsAuthorizedContext.Provider value={isAuthorized}>
      {children}
    </IsAuthorizedContext.Provider>
  );
}
