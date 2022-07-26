import { Link, useNavigate } from "react-router-dom";
import patternBgLight from "../../svg/authPage/patternBgLight.svg";
import { RiLoginCircleLine } from "react-icons/ri";
import { Logo } from "../../components/Logo/Logo";
import { useRef, useContext, useState } from "react";
import api from "../../utils/apiAxios/apiAxios";
import USER_ACTIONS from "../../context/User/userAction";
import socket from "../../utils/socketClient/socketClient";
import Input from "../../components/Input/Input";
import { isInitialLoadingContext } from "../../context/isInitialLoading/isInitialLoading";
import { IsLoginViaRefreshContext } from "../../context/isLoginViaRefresh/isLoginViaRefresh";
import Pill from "../../components/Buttons/Pill";

export const Login = ({ user }) => {
  const { userState, userDispatch } = user;
  const rememberMe = useRef();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setIsInitialLoading } = useContext(isInitialLoadingContext);
  const { setIsLoginViaRefresh } = useContext(IsLoginViaRefreshContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    userDispatch({ type: USER_ACTIONS.loginStart });
    const formValue = { username, password };

    try {
      const { data } = await api.post(
        "/auth/login",

        formValue,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      const loginCb = (success, message) => {
        if (success) {
          sessionStorage.setItem("token", data.token);
          userDispatch({ type: USER_ACTIONS.loginSuccess, payload: data.user });
          setIsLoginViaRefresh(false);
          setIsInitialLoading(true);
          navigate("/");
        } else {
          alert(message);
        }
      };

      // callback for handling error
      socket.emit(
        "login",
        { userId: data.user._id, token: data.token },
        loginCb
      );
    } catch (error) {}
  };
  return (
    <main className="flex min-h-screen w-full">
      <div
        className="basis-full lg:basis-2/3 min-h-screen shadow-inner blur-2xl lg:blur-none"
        style={{
          backgroundImage: `url(${patternBgLight})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      />
      <section
        aria-label="login-section"
        className="lg:basis-1/3 lg:min-w-[400px] min-h-screen lg:bg-gray-50 shadow-xl absolute lg:static inset-x-0 flex flex-col"
      >
        <div className="px-5 py-10 space-y-10 h-full flex flex-col grow sticky top-0 max-w-screen-sm lg:max-w-full container mx-auto">
          <header className="space-y-3 lg:space-y-5">
            <div className="absolute top-0 h-16 inset-x-0 p-2 z-20">
              <Logo />
            </div>
            <RiLoginCircleLine className="text-blue-600 text-2xl" />
            <h1 className="font-bold text-3xl">Login</h1>
            <span className="text-gray-500 text-xs">
              Login to start
              <span className="font-medium text-pink-600"> chatting </span>
              and
              <span className="font-medium text-blue-600"> Konnecting !</span>
            </span>
          </header>
          <form
            autoComplete="new-password"
            onSubmit={(e) => handleSubmit(e)}
            className="space-y-12 lg:space-y-16"
          >
            <div className="space-y-8 lg:space-y-10">
              <div className="space-y-5">
                <Input
                  type="text"
                  label="Username"
                  customState={[username, setUsername]}
                />
                <Input
                  type="password"
                  label="Password"
                  customState={[password, setPassword]}
                />
              </div>
              <div className="text-xs flex justify-between text-gray-500">
                <div className="flex items-center gap-1">
                  <input
                    id="remember"
                    type="checkbox"
                    className="accent-pink-400 cursor-pointer"
                    ref={rememberMe}
                  />
                  <label htmlFor="remember" className="cursor-pointer">
                    Remember Me
                  </label>
                </div>
                <Link
                  to="/login"
                  className="text-pink-400 underline underline-offset-4"
                >
                  Forgot Password
                </Link>
              </div>
            </div>

            {/* login button */}
            <div className="w-full flex flex-col items-center gap-3">
              <Pill
                type="submit"
                className="h-full text-base max-w-xs bg-blue-400 hover:bg-blue-300 text-gray-50 font-bold duration-200 border-0"
              >
                Login
              </Pill>
              <span className="text-gray-500 text-xs">
                Not Registered ? click here to{" "}
                <Link
                  to="/register"
                  className="text-pink-400 underline underline-offset-4 font-bold"
                >
                  Register
                </Link>
              </span>
            </div>
          </form>
          <footer className="grow flex items-end justify-center">
            <span className="text-xxs text-gray-400">
              Copyright &copy; 2022 | Konnect
            </span>
          </footer>
        </div>
      </section>
    </main>
  );
};
