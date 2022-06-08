import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import IsLoadingProvider from './context/isInitialLoading/IsInitialLoading';
import ModalContextProvider from './context/Modal/modalContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <IsLoadingProvider>
      <ModalContextProvider>
        <App />
      </ModalContextProvider>
    </IsLoadingProvider>
  </StrictMode>
);
