import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import UserContextProvider from './context/user/userContext';
import IsLoadingContextProvider from './context/isInitialLoading/isInitialLoading';
import ModalContextProvider from './context/modal/modalContext';
import IsAuthorizedContextProvider from './context/isAuthorized/isAuthorized';
import IsLoginViaRefreshContextProvider from './context/isLoginViaRefresh/isLoginViaRefresh';
import './index.css';
import NotificationsContextProvider from './context/notifications/notificationsContext';
import MiniModalContextProvider from './context/miniModal/miniModalContext';
import ActiveChatContextProvider from './context/activeChat/ActiveChatContext';
import MessageLogsContextProvider from './context/messageLogs/MessageLogsContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <IsLoginViaRefreshContextProvider>
    <UserContextProvider>
      <NotificationsContextProvider>
        <IsAuthorizedContextProvider>
          <IsLoadingContextProvider>
            <ModalContextProvider>
              <MiniModalContextProvider>
                <MessageLogsContextProvider>
                  <ActiveChatContextProvider>
                    <App />
                  </ActiveChatContextProvider>
                </MessageLogsContextProvider>
              </MiniModalContextProvider>
            </ModalContextProvider>
          </IsLoadingContextProvider>
        </IsAuthorizedContextProvider>
      </NotificationsContextProvider>
    </UserContextProvider>
  </IsLoginViaRefreshContextProvider>
);
