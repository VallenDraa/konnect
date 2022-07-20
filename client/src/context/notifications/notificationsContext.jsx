import { useCallback, useContext } from 'react';
import { useState, createContext, useEffect } from 'react';
import { UserContext } from '../user/userContext';

const defaultValue = {};

export const NotificationsContext = createContext(defaultValue);

export default function NotificationsContextProvider({ children }) {
  const { userState } = useContext(UserContext);
  const [notifications, setNotifications] = useState(defaultValue);

  const refreshNotifications = useCallback(() => {
    if (!userState.user) return;

    setNotifications(userState.user.requests);
  }, [userState]);

  useEffect(refreshNotifications, [refreshNotifications]);

  return (
    <NotificationsContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}
