import { createContext, useReducer } from 'react';
import modalReducer from './modalReducer';

const modalInitialValue = {
  isActive: false,
  isLoading: false,
  onExitReturnToHome: true,
  content: null,
};
export const ModalContext = createContext(modalInitialValue);

export default function ModalContextProvider({ children }) {
  const [modalState, modalDispatch] = useReducer(
    modalReducer,
    modalInitialValue
  );

  return (
    <ModalContext.Provider value={{ modalState, modalDispatch }}>
      {children}
    </ModalContext.Provider>
  );
}
