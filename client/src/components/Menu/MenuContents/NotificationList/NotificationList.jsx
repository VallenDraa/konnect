import { useContext, useState } from 'react';
import { MdOutlineMoveToInbox, MdOutlineOutbox } from 'react-icons/md';
import { NotificationsContext } from '../../../../context/notifications/notificationsContext';

import Dropdown from '../../../Dropdown/Dropdown';
import DropdownItem from '../../../Dropdown/DropdownItem/DropdownItem';

export default function NotificationList() {
  const NOTIFICATION_TABS = [
    { name: 'inbox', icon: MdOutlineMoveToInbox },
    { name: 'outbox', icon: MdOutlineOutbox },
  ];
  const [activeTab, setActiveTab] = useState(NOTIFICATION_TABS[0]);
  const { notifications } = useContext(NotificationsContext);

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
        <ul></ul>
      </main>
    </div>
  );
}
