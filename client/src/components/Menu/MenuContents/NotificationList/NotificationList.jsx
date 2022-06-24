import { useEffect, useContext, useState, Fragment } from 'react';
import { MdOutlineMoveToInbox, MdOutlineOutbox } from 'react-icons/md';
import { NotificationsContext } from '../../../../context/notifications/notificationsContext';
import { UserContext } from '../../../../context/user/userContext';
import RenderIf from '../../../../utils/React/RenderIf';
import api from '../../../../utils/apiAxios/apiAxios';
import Dropdown from '../../../Dropdown/Dropdown';
import DropdownItem from '../../../Dropdown/DropdownItem/DropdownItem';
import NotifListItem from './NotifListItem/NotifListItem';
import ContactNotif from './type/ContactNotif/ContactNotif';
import nothing from '../../../../svg/notificationList/nothing.svg';
import { useReducer } from 'react';
import notificationsReducer, {
  NOTIFICATIONS_ACTIONS,
  NOTIFICATIONS_DEFAULT,
} from '../../../../reducer/notifications/notificationsReducer';

export default function NotificationList() {
  const NOTIFICATION_TABS = [
    { name: 'inbox', icon: MdOutlineMoveToInbox },
    { name: 'outbox', icon: MdOutlineOutbox },
  ];
  const [activeTab, setActiveTab] = useState(NOTIFICATION_TABS[0]);
  const { notifications } = useContext(NotificationsContext);
  const { userState } = useContext(UserContext);
  const [detailedNotifs, detailedNotifsDispatch] = useReducer(
    notificationsReducer,
    NOTIFICATIONS_DEFAULT
  );

  useEffect(() => {
    const notifsArray = Object.entries(notifications);

    const getNotificationDetail = async (type, notif) => {
      detailedNotifsDispatch({ type: NOTIFICATIONS_ACTIONS.isLoading });
      const { inbox, outbox } = notif;
      setTimeout(async () => {
        try {
          // fetch the notification detail according to the type
          const { data } = await api.post(
            `/notification/notif_${type}_detail`,
            {
              ids: { inbox, outbox },
              userId: userState.user._id,
              token: sessionStorage.getItem('token'),
            }
          );

          // assign the type of notification to the final result
          const result = {
            inbox: [
              ...detailedNotifs.contents.inbox,
              ...data.inbox.map((item) => ({ type, ...item })),
            ],
            outbox: [
              ...detailedNotifs.contents.outbox,
              ...data.outbox.map((item) => ({ type, ...item })),
            ],
          };
          detailedNotifsDispatch({
            type: NOTIFICATIONS_ACTIONS.isLoaded,
            payload: result,
          });
        } catch (error) {
          detailedNotifsDispatch({
            type: NOTIFICATIONS_ACTIONS.isError,
            payload: error,
          });
        }
      }, 1000);
    };

    notifsArray.forEach(([type, value]) => getNotificationDetail(type, value));
  }, [notifications, userState]);

  return (
    <div className="py-4 space-y-5">
      <header>
        <nav className="relative w-fit">
          <Dropdown
            fontSize={14}
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
        <RenderIf conditionIs={detailedNotifs.error !== null}>
          {detailedNotifs.error}
        </RenderIf>
        <RenderIf
          conditionIs={detailedNotifs.isLoading && !detailedNotifs.error}
        >
          <span>loading</span>
        </RenderIf>
        <RenderIf
          conditionIs={!detailedNotifs.isLoading && !detailedNotifs.error}
        >
          <ul className="border-y-2 divide-y-2">
            {/* if there are no notifications */}
            <RenderIf
              conditionIs={detailedNotifs.contents[activeTab.name].length === 0}
            >
              <li className="text-center space-y-10 mt-10 py-4">
                <img src={nothing} alt="" className="max-w-[300px] mx-auto" />
                <span className="block font-semibold text-xl md:text-lg text-gray-500">
                  Nothing as far as the eye can see
                </span>
                <span className="font-light text-gray-400 text-xs">
                  Do some stuff and maybe something will show up here !
                </span>
              </li>
            </RenderIf>
            {/* if there are notifications */}
            <RenderIf
              conditionIs={detailedNotifs.contents[activeTab.name].length !== 0}
            >
              {detailedNotifs.contents[activeTab.name].map((info) => (
                <Fragment key={info._id}>
                  <RenderIf conditionIs={info.type === 'contacts'}>
                    <NotifListItem>
                      <ContactNotif info={info} type={activeTab.name} />
                    </NotifListItem>
                  </RenderIf>
                </Fragment>
              ))}
            </RenderIf>
          </ul>
        </RenderIf>
      </main>
    </div>
  );
}
