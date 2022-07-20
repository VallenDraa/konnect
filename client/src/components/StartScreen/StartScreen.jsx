import noActiveChat from '../../svg/home/noActiveChat.svg';
import { HiOutlineMenu } from 'react-icons/hi';
import CTA from '../CTA/CTA';
import { Logo } from '../Logo/Logo';

export const StartScreen = ({ handleGoToMenu }) => {
  return (
    <main className="basis-full lg:basis-3/4 shadow-inner bg-gray-100 relative h-screen flex flex-col gap-3 items-center justify-center tracking-wide px-5">
      <header className="bg-gray-50 absolute inset-x-0 z-10 shadow-inner p-3 border-b-2 top-0">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex justify-between items-center grow sm:flex-grow-0 gap-3">
            {/* sidebar btn (will show up when screen is <lg) */}
            <button
              onClick={handleGoToMenu}
              className="block lg:hidden hover:text-blue-400 duration-200 text-2xl"
            >
              <HiOutlineMenu />
            </button>
            <div className="relative bottom-[1px] ">
              <Logo />
            </div>
          </div>

          <CTA className="flex justify-evenly gap-2 basis-full sm:basis-2/3 md:basis-1/2 xl:basis-[40%]" />
        </div>
      </header>
      {/* <img src={noActiveChat} className="w-2/3 md:w-1/3" />
      <h1 className="font-bold text-2xl md:text-3xl text-gray-600">
        Go Start a Chat !
      </h1>
      <span className="text-gray-500 font-light text-xs text-center md:text-sm">
        Click one of the available messages or go start a new one by pressing
        the <span className="font-semibold text-gray-600">New Chat</span>{' '}
        button.
      </span> */}
    </main>
  );
};
