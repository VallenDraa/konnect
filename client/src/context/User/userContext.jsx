import { createContext, useReducer } from 'react';
import userReducer from './userReducer';

const userInitialValue = {
  user: sessionStorage.getItem('token')
    ? JSON.parse(atob(sessionStorage.getItem('token').split('.')[1]))
    : null,
  error: null,
};

export const UserContext = createContext(userInitialValue);

export default function UserContextProvider({ children }) {
  const [userState, userDispatch] = useReducer(userReducer, userInitialValue);

  return (
    <UserContext.Provider value={{ userState, userDispatch }}>
      {children}
    </UserContext.Provider>
  );
}
