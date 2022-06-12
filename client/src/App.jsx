import { useContext } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { UserContext } from './context/User/userContext';
import { Home } from './pages/Home/Home';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';

export const App = () => {
  const { userState } = useContext(UserContext);

  return (
    <div className="text-gray-800">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={userState.user ? <Home /> : <Navigate to="/register" />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};
