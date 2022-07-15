import { useState } from "react";
import { CgProfile } from "react-icons/cg";
import { MdOutlineManageAccounts } from "react-icons/md";
import { BsGear } from "react-icons/bs";
import { TbPhoneCall } from "react-icons/tb";
import { BiMessageAltDetail } from "react-icons/bi";
import RenderIf from "../../../../utils/React/RenderIf";
import ProfileOpt from "./components/ProfileOpt";
import AccountOpt from "./components/AccountOpt";
import GeneralOpt from "./components/GeneralOpt/GeneralOpt";
import CallsOpt from "./components/CallsOpt";
import MessagesOpt from "./components/MessagesOpt";
import SettingsMenu from "./SettingsMenu";

export const MyProfileModalContent = () => {
  const options = [
    { name: "profile", icon: <CgProfile /> },
    { name: "account", icon: <MdOutlineManageAccounts /> },
    { name: "general", icon: <BsGear /> },
    // { name: 'calls', icon: <TbPhoneCall /> },
    // { name: 'messages', icon: <BiMessageAltDetail /> },
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
      <main className="flex flex-col md:flex-row grow shadow-inner">
        <SettingsMenu
          options={options}
          activeOptState={{ activeOpt, setActiveOpt }}
        />
        <main className="w-full grow md:min-h-full h-0 bg-white overflow-y-auto">
          <RenderIf conditionIs={activeOpt === "profile"}>
            <ProfileOpt />
          </RenderIf>
          <RenderIf conditionIs={activeOpt === "account"}>
            <AccountOpt />
          </RenderIf>
          <RenderIf conditionIs={activeOpt === "general"}>
            <GeneralOpt />
          </RenderIf>
          <RenderIf conditionIs={activeOpt === "calls"}>
            <CallsOpt />
          </RenderIf>
          <RenderIf conditionIs={activeOpt === "messages"}>
            <MessagesOpt />
          </RenderIf>
        </main>
      </main>
    </section>
  );
};
