import { createContext, useState } from 'react';

export const IsLoginViaRefreshContext = createContext(true);

export default function IsLoginViaRefreshContextProvider({ children }) {
  const [isLoginViaRefresh, setIsLoginViaRefresh] = useState(true);

  return (
    <IsLoginViaRefreshContext.Provider
      value={{ isLoginViaRefresh, setIsLoginViaRefresh }}
    >
      {children}
    </IsLoginViaRefreshContext.Provider>
  );
}
