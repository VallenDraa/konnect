import {
  RiChatQuoteFill,
  RiChatQuoteLine,
  RiContactsBook2Fill,
  RiContactsBook2Line,
  RiNotification3Fill,
  RiNotification3Line,
  RiSearchEyeFill,
  RiSearchEyeLine,
} from 'react-icons/ri';
const MENUS = [
  { name: 'chats', icon: RiChatQuoteLine, activeIcon: RiChatQuoteFill },
  {
    name: 'contacts',
    icon: RiContactsBook2Line,
    activeIcon: RiContactsBook2Fill,
  },
  { name: 'search', icon: RiSearchEyeLine, activeIcon: RiSearchEyeFill },
  {
    name: 'notifications',
    icon: RiNotification3Line,
    activeIcon: RiNotification3Fill,
  },
];

export default MENUS;
