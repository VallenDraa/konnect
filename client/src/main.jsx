import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import UserContextProvider from './context/User/userContext';
import IsLoadingContextProvider from './context/isInitialLoading/isInitialLoading';
import ModalContextProvider from './context/Modal/modalContext';
import IsAuthorizedContextProvider from './context/isAuthorized/isAuthorized';
import IsLoginViaRefreshContextProvider from './context/isLoginViaRefresh/isLoginViaRefresh';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <IsLoginViaRefreshContextProvider>
    <UserContextProvider>
      <IsAuthorizedContextProvider>
        <IsLoadingContextProvider>
          <ModalContextProvider>
            <App />
          </ModalContextProvider>
        </IsLoadingContextProvider>
      </IsAuthorizedContextProvider>
    </UserContextProvider>
  </IsLoginViaRefreshContextProvider>
);
