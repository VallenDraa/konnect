import { useContext } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { UserContext } from './context/user/userContext';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import Home from './pages/Home/Home';
import RenderIf from './utils/React/RenderIf';

export const App = () => {
  const { userState, userDispatch } = useContext(UserContext);
  console.log(userState);

  return (
    <div className="text-gray-800">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={userState.user ? <Home /> : <Navigate to="/register" />}
          >
            <Route
              path="/user/:username"
              element={userState.user ? <Home /> : <Navigate to="/register" />}
            />
            <Route
              path="/notifications"
              element={userState.user ? <Home /> : <Navigate to="/register" />}
            />
            <Route
              path="/search"
              element={userState.user ? <Home /> : <Navigate to="/register" />}
            />
            <Route
              path="/contacts"
              element={userState.user ? <Home /> : <Navigate to="/register" />}
            />
            <Route
              path="/chats"
              element={userState.user ? <Home /> : <Navigate to="/register" />}
            />
            <Route
              path="/new/:type"
              element={userState.user ? <Home /> : <Navigate to="/register" />}
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
  );
};
