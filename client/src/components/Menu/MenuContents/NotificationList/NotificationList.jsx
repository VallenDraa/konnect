import { useEffect, useContext, useState } from 'react';
import { MdOutlineMoveToInbox, MdOutlineOutbox } from 'react-icons/md';
import { NotificationsContext } from '../../../../context/notifications/notificationsContext';
import api from '../../../../utils/apiAxios/apiAxios';
import Dropdown from '../../../Dropdown/Dropdown';
import DropdownItem from '../../../Dropdown/DropdownItem/DropdownItem';
import { UserContext } from '../../../../context/user/userContext';

export default function NotificationList() {
  const NOTIFICATION_TABS = [
    { name: 'inbox', icon: MdOutlineMoveToInbox },
    { name: 'outbox', icon: MdOutlineOutbox },
  ];
  const [activeTab, setActiveTab] = useState(NOTIFICATION_TABS[0]);
  const { notifications } = useContext(NotificationsContext);
  const { userState } = useContext(UserContext);
  const [detailedNotifs, setDetailedNotifs] = useState({
    inbox: [],
    outbox: [],
  });

  useEffect(() => {
    const notifsArray = Object.entries(notifications);

    const getNotificationDetail = async (type, notif) => {
      const { inbox, outbox } = notif;

      const { data } = await api.post(`/notification/notif_${type}_detail`, {
        ids: { inbox, outbox },
        userId: userState.user._id,
        token: sessionStorage.getItem('token'),
      });

      setDetailedNotifs(data);
    };

    notifsArray.forEach(([type, value]) => getNotificationDetail(type, value));
  }, [notifications, userState]);

  useEffect(() => {
    console.log(detailedNotifs);
  }, [detailedNotifs]);

  return (
    <div className="py-4 space-y-5">
      <header>
        <nav className="relative w-fit">
          <Dropdown
            icon={activeTab.icon()}
            text={activeTab.name}
            position={'origin-top-left left-0'}
          >
            {NOTIFICATION_TABS.map((tab) => (
              <DropdownItem
                key={tab.name}
                onClick={() => setActiveTab(tab)}
                isActive={tab.name === activeTab.name}
                className="flex items-center gap-x-1"
              >
                {tab.icon({ className: 'text-sm' })}
                <span className="text-xs capitalize">{tab.name}</span>
              </DropdownItem>
            ))}
          </Dropdown>
        </nav>
      </header>
      <main>
        <ul>
          {detailedNotifs[activeTab.name].map(({ by, iat }) => {
            return (
              <li>
                {by.username}
                {by.initials}
                {iat}
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
