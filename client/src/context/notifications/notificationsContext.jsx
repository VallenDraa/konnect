import { useContext } from 'react';
import { useState, createContext, useEffect } from 'react';
import { UserContext } from '../user/userContext';

const defaultValue = {
  inbox: [],
  outbox: [],
};

export const NotificationsContext = createContext(defaultValue);

export default function NotificationsContextProvider({ children }) {
  const { userState } = useContext(UserContext);
  const [notifications, setNotifications] = useState(defaultValue);

  useEffect(() => {
    setNotifications({ inbox: [], outbox: [] });
    const requests = Object.entries(userState.user.requests);

    requests.forEach(([key, req]) => {
      setNotifications((prev) => ({
        inbox: [...prev.inbox, ...req['inbox']],
        outbox: [...prev.outbox, ...req['outbox']],
      }));
    });
  }, [userState]);

  return (
    <NotificationsContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}
