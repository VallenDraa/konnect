import { CgProfile } from 'react-icons/cg';
import { MdOutlineManageAccounts } from 'react-icons/md';
import { BsGear } from 'react-icons/bs';

const SETTINGS_MENU = [
  { name: 'profile', icon: <CgProfile /> },
  { name: 'account', icon: <MdOutlineManageAccounts /> },
  { name: 'general', icon: <BsGear /> },
  // { name: 'calls', icon: <TbPhoneCall /> },
  // { name: 'messages', icon: <BiMessageAltDetail /> },
];

export default SETTINGS_MENU;
