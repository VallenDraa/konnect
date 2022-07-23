import { useState } from 'react';
import RenderIf from '../../../../utils/React/RenderIf';
import ProfileOpt from './components/ProfileOpt';
import AccountOpt from './components/AccountOpt';
import GeneralOpt from './components/GeneralOpt/GeneralOpt';
import CallsOpt from './components/CallsOpt';
import MessagesOpt from './components/MessagesOpt';
import SettingsMenu from './SettingsMenu';
import SETTINGS_MENU from './SETTINGS_MENU';

export const MyProfileModalContent = () => {
  const [activeOpt, setActiveOpt] = useState(SETTINGS_MENU[0].name);

  return (
    <section
      aria-label="settings"
      className="w-screen lg:w-[40rem] flex flex-col h-full"
    >
      <div className="flex flex-col lg:flex-row grow shadow-inner">
        <SettingsMenu
          options={SETTINGS_MENU}
          activeOptState={{ activeOpt, setActiveOpt }}
        />
        <div className="w-full grow lg:min-h-full h-0 bg-white overflow-y-auto">
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
        </div>
      </div>
    </section>
  );
};
