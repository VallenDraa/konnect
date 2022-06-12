import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import UserContextProvider from './context/User/userContext';

import IsLoadingProvider from './context/isInitialLoading/isInitialLoading';
import ModalContextProvider from './context/Modal/modalContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <UserContextProvider>
    <IsLoadingProvider>
      <ModalContextProvider>
        <App />
      </ModalContextProvider>
    </IsLoadingProvider>
  </UserContextProvider>
);
