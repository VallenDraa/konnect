import { useEffect, useContext, useState, Fragment, useMemo } from 'react';
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
import USER_ACTIONS from '../../../../context/user/userAction';

export default function NotificationList() {
  const NOTIFICATION_TABS = [
    { name: 'inbox', icon: MdOutlineMoveToInbox },
    { name: 'outbox', icon: MdOutlineOutbox },
  ];
  const [activeBox, setActiveBox] = useState(NOTIFICATION_TABS[0]);
  const { notifications } = useContext(NotificationsContext);
  const { userState, userDispatch } = useContext(UserContext);
  const [userId] = useState(userState.user._id);
  const [detailedNotifs, detailedNotifsDispatch] = useReducer(
    notificationsReducer,
    NOTIFICATIONS_DEFAULT
  );
  const location = useLocation();
  const [activeLocation, setActiveLocation] = useState(location);

  // get notification detail
  useEffect(() => {
    // prevent the codes below from executing if any of the notifs are not seen yet
    let isSeen = false;

    for (const type in notifications) {
      // if one of the notifications has been seen break
      if (isSeen) break;

      // if the notifs inbox/outbox array is empty
      if (notifications[type][activeBox.name].length === 0) return;

      const notifBoxContent = notifications[type][activeBox.name];

      isSeen = notifBoxContent.every((notif) => notif.seen === true);
    }

    // will only execute if the notifcations are seen
    if (isSeen) {
      const notifsArray = Object.entries(notifications);
      // the type parameter would be something like contact notif, message, and etc
      const getNotificationDetail = async (type, notif) => {
        detailedNotifsDispatch({ type: NOTIFICATIONS_ACTIONS.isLoading });
        const { inbox, outbox } = notif;

        try {
          // fetch the notification detail according to the type
          const { data } = await api.post(
            `/notification/notif_${type}_detail`,
            {
              userId,
              ids: { inbox, outbox },
              token: sessionStorage.getItem('token'),
            }
          );

          // assign the type of notification to the final result

          const result = { inbox: [], outbox: [] };

          // prevent the component from rendering old duplicate notifications
          for (const box in result) {
            result[box] = data[box].map((newNotif, i) => {
              const prev = detailedNotifs.contents.inbox;

              if (!prev[i]) return { type, ...newNotif };

              return prev.sentAt <= newNotif.sentAt
                ? { type, ...newNotif }
                : { type, ...prev[i] };
            });
          }

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

      notifsArray.forEach(([type, value]) =>
        getNotificationDetail(type, value)
      );
    }
  }, [notifications, userState]);

  // change the active location if the pathname and search query had changed
  useEffect(() => {
    if (location.pathname === activeLocation.pathname) return;
    if (location.search === activeLocation.search) return;

    setActiveLocation(location);
  }, [location]);

  // change the activebox accoridng to the box url
  useEffect(() => {
    // parse the query url
    if (activeLocation.pathname !== '/notifications') return;

    const search = Object.fromEntries(
      activeLocation.search
        .replace('?', '')
        .split('&')
        .map((s) => s.split('='))
    );

    const targetBox = NOTIFICATION_TABS.find((n) => n.name === search.box);

    setActiveBox(targetBox || NOTIFICATION_TABS[0]);
  }, [activeLocation]);

  // if user selected one of the box, then set all the contents of that box to seen
  useEffect(() => {
    const updateNotifSeen = async (boxType) => {
      try {
        const { data } = await api.put('/notification/set_notif_to_seen', {
          notifIds,
          boxType,
          userId,
          token: sessionStorage.getItem('token'),
        });

        sessionStorage.setItem('token', data.token);
        userDispatch({ type: USER_ACTIONS.updateSuccess, payload: data.user });
      } catch (error) {
        userDispatch({ type: USER_ACTIONS.updateFailure, payload: error });
      }
    };

    const { name } = activeBox;
    const notifIds = []; // the notif ids whose seen parameter will be changed to true

    // loop over the [NOTIF_TYPES]
    for (const nt in notifications) {
      // loop over notif contents to see if it has been seen
      for (const { seen, _id } of notifications[nt][name]) {
        !seen && notifIds.push(_id);
      }
    }

    // will reach for the api if the notifIds is not empty
    notifIds.length !== 0 && updateNotifSeen(name);
  }, [activeBox, userId]);

  return (
    <div className="pt-3 space-y-3">
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
                <Fragment key={`${info._id}_${info.sentAt}`}>
                  {/* if the type is contact */}
                  <RenderIf conditionIs={info.type === 'contacts'}>
                    <NotifListItem>
                      <ContactNotif info={info} type={activeBox.name} />
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
