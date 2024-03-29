import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import UserContextProvider from "./context/user/userContext";
import IsLoadingContextProvider from "./context/isInitialLoading/isInitialLoading";
import ModalContextProvider from "./context/modal/modalContext";
import IsAuthorizedContextProvider from "./context/isAuthorized/isAuthorized";
import IsLoginViaRefreshContextProvider from "./context/isLoginViaRefresh/isLoginViaRefresh";
import "./index.css";
import MiniModalContextProvider from "./context/miniModal/miniModalContext";
import MessageLogsContextProvider from "./context/messageLogs/MessageLogsContext";
import ContactsContextProvider from "./context/contactContext/ContactContext";
import NotifContextProvider from "./context/notifContext/NotifContext";
import SettingsContextProvider from "./context/settingsContext/SettingsContext";
import TitleContextProvider from "./context/titleContext/TitleContext";
import ActivePrivateChatContextProvider from "./context/activePrivateChat/ActivePrivateChatContext";
import ActiveGroupChatContextProvider from "./context/activeGroupChat/ActiveGroupChatContext";
import CachedUserContextProvider from "./context/cachedUser/CachedUserContext";
import FCMContextProvider from "./context/FCMContext/FCMContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <TitleContextProvider>
    <IsLoginViaRefreshContextProvider>
      <UserContextProvider>
        <CachedUserContextProvider>
          <SettingsContextProvider>
            <ContactsContextProvider>
              <NotifContextProvider>
                <IsAuthorizedContextProvider>
                  <IsLoadingContextProvider>
                    <ModalContextProvider>
                      <MiniModalContextProvider>
                        <MessageLogsContextProvider>
                          <ActivePrivateChatContextProvider>
                            <ActiveGroupChatContextProvider>
                              <FCMContextProvider>
                                <App />
                              </FCMContextProvider>
                            </ActiveGroupChatContextProvider>
                          </ActivePrivateChatContextProvider>
                        </MessageLogsContextProvider>
                      </MiniModalContextProvider>
                    </ModalContextProvider>
                  </IsLoadingContextProvider>
                </IsAuthorizedContextProvider>
              </NotifContextProvider>
            </ContactsContextProvider>
          </SettingsContextProvider>
        </CachedUserContextProvider>
      </UserContextProvider>
    </IsLoginViaRefreshContextProvider>
  </TitleContextProvider>
);
