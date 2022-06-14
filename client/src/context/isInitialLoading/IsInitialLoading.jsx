import { createContext, useState } from 'react';

export const isInitialLoadingContext = createContext(true);

export default function IsInitialLoadingContextProvider({ children }) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  return (
    <isInitialLoadingContext.Provider
      value={{ isInitialLoading, setIsInitialLoading }}
    >
      {children}
    </isInitialLoadingContext.Provider>
  );
}
