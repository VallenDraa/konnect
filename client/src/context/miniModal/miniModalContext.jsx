import { createContext, useEffect, useReducer } from "react";
import miniModalReducer from "./miniModalReducer";

const miniModalInitialValue = {
  isActive: false,
  isClosing: false,
  title: null,
  closeButton: false,
  content: null,
};
export const MiniModalContext = createContext(miniModalInitialValue);

export default function MiniModalContextProvider({ children }) {
  const [miniModalState, miniModalDispatch] = useReducer(
    miniModalReducer,
    miniModalInitialValue
  );
  // useEffect(() => {
  //   console.log(miniModalState);
  // }, [miniModalState]);

  return (
    <MiniModalContext.Provider value={{ miniModalState, miniModalDispatch }}>
      {children}
    </MiniModalContext.Provider>
  );
}
