import { Link, useNavigate } from "react-router-dom";
import patternBgLight from "../../svg/authPage/patternBgLight.svg";
import { RiLoginCircleLine } from "react-icons/ri";
import { Logo } from "../../components/Logo/Logo";
import Input from "../../components/Input/Input";
import api from "../../utils/apiAxios/apiAxios";
import { useState } from "react";
import Pill from "../../components/Buttons/Pill";

export const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formValue = { email, username, password };

    try {
      const { data } = await api.post(
        "/auth/register",

        formValue,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      if (data.success) {
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
    }
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
      <section className="lg:basis-1/3 lg:min-w-[400px] min-h-screen lg:bg-gray-50 shadow-xl absolute lg:static inset-x-0 flex flex-col">
        <div className="px-5 py-10 space-y-10 h-full flex flex-col grow sticky top-0">
          <header className="space-y-3 lg:space-y-5">
            <div className="absolute top-0 h-16 inset-x-0 p-2 z-20">
              <Logo />
            </div>
            <RiLoginCircleLine className="text-blue-600 text-2xl" />
            <h1 className="font-bold text-3xl">Register</h1>
            <span className="text-gray-500 text-xs">
              Register to Make a new{" "}
              <span className="font-medium text-pink-600">Account</span>
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
                  type="email"
                  label="Email"
                  customState={[email, setEmail]}
                />
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
            </div>

            {/* Register button */}
            <div className="w-full flex flex-col items-center gap-3">
              <Pill
                type="submit"
                className="h-full text-base max-w-xs bg-blue-400 hover:bg-blue-300 text-gray-50  font-bold duration-200 border-0"
              >
                Register
              </Pill>
              <span className="text-gray-500 text-xs">
                Got an account ? click here to{" "}
                <Link
                  to="/login"
                  className="text-pink-400 underline underline-offset-4 font-bold"
                >
                  Login
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
