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
import { useLocation } from 'react-router-dom';

export default function NotificationList() {
  const NOTIFICATION_TABS = [
    { name: 'inbox', icon: MdOutlineMoveToInbox },
    { name: 'outbox', icon: MdOutlineOutbox },
  ];
  const [activeBox, setActiveBox] = useState(NOTIFICATION_TABS[0]);
  const { notifications } = useContext(NotificationsContext);
  const { userState } = useContext(UserContext);
  const [detailedNotifs, detailedNotifsDispatch] = useReducer(
    notificationsReducer,
    NOTIFICATIONS_DEFAULT
  );
  const location = useLocation();

  // get notification detail
  useEffect(() => {
    console.log(notifications);

    const notifsArray = Object.entries(notifications);

    const getNotificationDetail = async (type, notif) => {
      detailedNotifsDispatch({ type: NOTIFICATIONS_ACTIONS.isLoading });
      const { inbox, outbox } = notif;

      try {
        // fetch the notification detail according to the type
        const { data } = await api.post(`/notification/notif_${type}_detail`, {
          ids: { inbox, outbox },
          userId: userState.user._id,
          token: sessionStorage.getItem('token'),
        });

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
    };

    notifsArray.forEach(([type, value]) => getNotificationDetail(type, value));
  }, [notifications, userState]);

  // change the activebox accoridng to the box url
  useEffect(() => {
    // parse the query url
    if (location.pathname !== '/notifications') return;

    const search = Object.fromEntries(
      location.search
        .replace('?', '')
        .split('&')
        .map((s) => s.split('='))
    );

    const targetBox = NOTIFICATION_TABS.find((n) => n.name === search.box);

    setActiveBox(targetBox || NOTIFICATION_TABS[0]);
  }, [location]);

  return (
    <div className="py-4 space-y-5">
      <header>
        <nav className="relative w-fit">
          <Dropdown
            fontSize={14}
            icon={activeBox.icon()}
            text={activeBox.name}
            position={'origin-top-left left-0'}
          >
            {NOTIFICATION_TABS.map((tab) => (
              <DropdownItem
                key={tab.name}
                onClick={() => setActiveBox(tab)}
                to={`/notifications?box=${tab.name}`}
                isActive={tab.name === activeBox.name}
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
        {/* if an error happened */}
        <RenderIf conditionIs={detailedNotifs.error !== null}>
          {detailedNotifs.error}
        </RenderIf>

        {/* if the current notifs batch is still loading */}
        <RenderIf
          conditionIs={detailedNotifs.isLoading && !detailedNotifs.error}
        >
          <span>loading</span>
        </RenderIf>

        {/* if notifs are fine */}
        <RenderIf
          conditionIs={!detailedNotifs.isLoading && !detailedNotifs.error}
        >
          <ul className="border-y-2 divide-y-2">
            {/* if there are no notifications */}
            <RenderIf
              conditionIs={detailedNotifs.contents[activeBox.name].length === 0}
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
              conditionIs={detailedNotifs.contents[activeBox.name].length !== 0}
            >
              {detailedNotifs.contents[activeBox.name].map((info) => (
                <Fragment key={info._id}>
                  {/* if the type is contact */}
                  <RenderIf conditionIs={info.type === 'contacts'}>
                    <RenderIf conditionIs={info.answer !== false}>
                      <NotifListItem>
                        <ContactNotif info={info} type={activeBox.name} />
                      </NotifListItem>
                    </RenderIf>
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
