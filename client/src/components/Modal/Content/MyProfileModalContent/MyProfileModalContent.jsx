import { useState } from 'react';
import { CgProfile } from 'react-icons/cg';
import { MdOutlineManageAccounts } from 'react-icons/md';
import { BsGear } from 'react-icons/bs';
import { TbPhoneCall } from 'react-icons/tb';
import { BiMessageAltDetail } from 'react-icons/bi';
import RenderIf from '../../../../utils/React/RenderIf';
import ProfileOpt from './components/ProfileOpt';
import AccountOpt from './components/AccountOpt';
import GeneralOpt from './components/GeneralOpt/GeneralOpt';
import CallsOpt from './components/CallsOpt';
import MessagesOpt from './components/MessagesOpt';

export const MyProfileModalContent = () => {
  const options = [
    { name: 'profile', icon: <CgProfile /> },
    { name: 'account', icon: <MdOutlineManageAccounts /> },
    { name: 'general', icon: <BsGear /> },
    { name: 'calls', icon: <TbPhoneCall /> },
    { name: 'messages', icon: <BiMessageAltDetail /> },
  ];

  const [activeOpt, setActiveOpt] = useState(options[0].name);

  return (
    <section
      aria-label="settings"
      className="w-screen md:w-[40rem] flex flex-col h-full"
    >
      <header className="text-center">
        <h1 className="font-semibold pb-3">Settings</h1>
      </header>
      <main className="flex grow shadow-inner">
        <aside className="bg-gray-100 basis-1/4 md:basis-1/3">
          <ul>
            {options.map((opt, i) => {
              return (
                <li
                  key={i}
                  onClick={() => setActiveOpt(opt.name)}
                  className={`${
                    opt.name === activeOpt
                      ? 'bg-white text-gray-800 font-semibold'
                      : 'hover:bg-gray-200 text-gray-500 hover:text-gray-600 font-medium'
                  } cursor-pointer p-2 capitalize duration-200 text-sm md:text-base flex items-center gap-2`}
                >
                  <span className="text-base md:text-lg">{opt.icon}</span>
                  <span>{opt.name}</span>
                </li>
              );
            })}
          </ul>
        </aside>
        <main className="w-full max-h-[90vh] md:h-[65vh] bg-white overflow-y-auto">
          <RenderIf conditionIs={activeOpt === 'profile'}>
            <ProfileOpt />
          </RenderIf>
          <RenderIf conditionIs={activeOpt === 'account'}>
            <AccountOpt />
          </RenderIf>
          <RenderIf conditionIs={activeOpt === 'general'}>
            <GeneralOpt />
          </RenderIf>
          <RenderIf conditionIs={activeOpt === 'calls'}>
            <CallsOpt />
          </RenderIf>
          <RenderIf conditionIs={activeOpt === 'messages'}>
            <MessagesOpt />
          </RenderIf>
        </main>
      </main>
    </section>
  );
};
