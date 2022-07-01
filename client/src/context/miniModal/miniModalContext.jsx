import { createContext, useReducer } from 'react';
import miniModalReducer from './miniModalReducer';

const miniModalInitialValue = {
  isActive: false,
  isClosing: false,
  content: null,
};
export const MiniModalContext = createContext(miniModalInitialValue);

export default function MiniModalContextProvider({ children }) {
  const [miniModalState, miniModalDispatch] = useReducer(
    miniModalReducer,
    miniModalInitialValue
  );

  return (
    <MiniModalContext.Provider value={{ miniModalState, miniModalDispatch }}>
      {children}
    </MiniModalContext.Provider>
  );
}
