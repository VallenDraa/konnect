import { useContext, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { UserContext } from "./context/user/userContext";
import { Login } from "./pages/Login/Login";
import { Register } from "./pages/Register/Register";
import Home from "./pages/Home/Home";
import RenderIf from "./utils/React/RenderIf";
import ActiveChatHandlerProvider from "./context/activeChatHandler/ActiveChatHandler";
import { MessageLogsContext } from "./context/messageLogs/MessageLogsContext";
import { NotifContext } from "./context/notifContext/NotifContext";
import { TitleContext } from "./context/titleContext/TitleContext";
import { SettingsContext } from "./context/settingsContext/SettingsContext";
import newNotifSfx from "./audio/newNotifSfx.mp3";
import useDetectFirstRender from "./utils/React/hooks/useDetectFirstRender/useDetectFirstRender";

export const App = () => {
  const { userState, userDispatch } = useContext(UserContext);
  const { msgUnread } = useContext(MessageLogsContext);
  const { notifUnseen } = useContext(NotifContext);
  const { setTitle } = useContext(TitleContext);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const isFirstRender = useDetectFirstRender();

  // for displaying the amount of notifications available
  useEffect(() => {
    const total = msgUnread.total + notifUnseen.total;

    setTitle((prev) => ({
      ...prev,
      prefix: total > 0 ? `(${total}) ` : "",
    }));
  }, [msgUnread.total, notifUnseen.total, isFirstRender]);

  return (
    <ActiveChatHandlerProvider>
      <div
        className={`text-gray-800 antialiased font-sans ${
          general?.theme === "dark" ? "dark" : ""
        }`}
      >
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={userState.user ? <Home /> : <Navigate to="/register" />}
            >
              <Route
                path="/user/:username"
                element={
                  userState.user ? <Home /> : <Navigate to="/register" />
                }
              />
              <Route
                path="/notifications"
                element={
                  userState.user ? <Home /> : <Navigate to="/register" />
                }
              />
              <Route
                path="/search"
                element={
                  userState.user ? <Home /> : <Navigate to="/register" />
                }
              />
              <Route
                path="/contacts"
                element={
                  userState.user ? <Home /> : <Navigate to="/register" />
                }
              />
              <Route
                path="/chats"
                element={
                  userState.user ? <Home /> : <Navigate to="/register" />
                }
              />
              <Route
                path="/new/:type"
                element={
                  userState.user ? <Home /> : <Navigate to="/register" />
                }
              />
            </Route>
            <Route
              path="/login"
              element={
                <>
                  <RenderIf conditionIs={userState.user}>
                    <Navigate to="/" />
                  </RenderIf>
                  <RenderIf conditionIs={!userState.user}>
                    <Login user={{ userState, userDispatch }} />
                  </RenderIf>
                </>
              }
            />
            <Route
              path="/register"
              element={userState.user ? <Navigate to="/" /> : <Register />}
            />
            <Route path="*" element={<Navigate to="/chats" />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ActiveChatHandlerProvider>
  );
};
