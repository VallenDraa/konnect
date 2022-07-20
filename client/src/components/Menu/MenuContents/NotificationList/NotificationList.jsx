import { useEffect, useContext, useState, Fragment } from 'react';
import { MdOutlineMoveToInbox, MdOutlineOutbox } from 'react-icons/md';
import { UserContext } from '../../../../context/user/userContext';
import RenderIf from '../../../../utils/React/RenderIf';
import api from '../../../../utils/apiAxios/apiAxios';
import Dropdown from '../../../Dropdown/Dropdown';
import DropdownItem from '../../../Dropdown/DropdownItem/DropdownItem';
import NotifListItem from './NotifListItem/NotifListItem';
import ContactNotif from './type/ContactNotif/ContactNotif';
import nothing from '../../../../svg/notificationList/nothing.svg';
import { useLocation } from 'react-router-dom';
import USER_ACTIONS from '../../../../context/user/userAction';
import { NotifContext } from '../../../../context/notifContext/NotifContext';

export default function NotificationList() {
  const NOTIFICATION_TABS = [
    { name: 'inbox', icon: MdOutlineMoveToInbox },
    { name: 'outbox', icon: MdOutlineOutbox },
  ];
  const [activeBox, setActiveBox] = useState(NOTIFICATION_TABS[0]);
  const { notifs } = useContext(NotifContext);
  const { userState, userDispatch } = useContext(UserContext);
  const [userId] = useState(userState.user._id);
  const location = useLocation();
  const [activeLocation, setActiveLocation] = useState(location);

  // change the active location if the pathname and search query had changed
  useEffect(() => {
    if (location.pathname === activeLocation.pathname) return;
    if (location.search === activeLocation.search) return;

    setActiveLocation(location);
  }, [location]);

  // change the activebox according to the box url
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
  // useEffect(() => {
  //   const updateNotifSeen = async (boxType) => {
  //     try {
  //       const { data } = await api.put(
  //         '/notification/set_notif_to_seen',
  //         { notifIds, boxType, userId },
  //         {
  //           headers: {
  //             Authorization: `Bearer ${sessionStorage.getItem('token')}`,
  //           },
  //         }
  //       );

  //       sessionStorage.setItem('token', data.token);
  //       userDispatch({ type: USER_ACTIONS.updateSuccess, payload: data.user });
  //     } catch (error) {
  //       userDispatch({ type: USER_ACTIONS.updateFailure, payload: error });
  //     }
  //   };

  //   const { name } = activeBox;
  //   const notifIds = []; // the notif ids whose seen parameter will be changed to true

  //   // loop over the [NOTIF_TYPES]
  //   for (const nt in notifications) {
  //     // loop over notif contents to see if it has been seen
  //     for (const { seen, _id } of notifications[nt][name]) {
  //       !seen && notifIds.push(_id);
  //     }
  //   }

  //   // will reach for the api if the notifIds is not empty
  //   notifIds.length !== 0 && updateNotifSeen(name);
  // }, [activeBox, userId]);

  return (
    <div className="p-3 space-y-3">
      <header>
        <nav className="relative w-fit">
          <Dropdown
            offset={8}
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
        <RenderIf conditionIs={notifs.error !== null}>{notifs.error}</RenderIf>

        {/* if the current notifs batch is still loading */}
        <RenderIf conditionIs={notifs.isLoading && !notifs.error}>
          <span>loading</span>
        </RenderIf>

        {/* if notifs are fine */}
        <RenderIf conditionIs={!notifs.isLoading && !notifs.error}>
          <ul className="border-y-2 divide-y-2">
            {/* if there are no notifications */}
            <RenderIf
              conditionIs={notifs?.content[activeBox.name]?.length === 0}
            >
              <li className="text-center space-y-10 mt-10 py-4">
                <img src={nothing} alt="" className="max-w-[300px] mx-auto" />
                <span className="block font-semibold text-xl md:text-lg text-gray-500">
                  <RenderIf conditionIs={activeBox.name === 'inbox'}>
                    Inbox is empty
                  </RenderIf>
                  <RenderIf conditionIs={activeBox.name === 'outbox'}>
                    Outbox is empty
                  </RenderIf>
                </span>
                <span className="font-light text-gray-400 text-xs">
                  Something will show up here eventually ...
                </span>
              </li>
            </RenderIf>
            {/* if there are notifications */}
            <RenderIf
              conditionIs={notifs?.content[activeBox.name]?.length !== 0}
            >
              {notifs?.content[activeBox.name]?.map((info) => {
                return (
                  <Fragment key={info._id}>
                    <RenderIf conditionIs={info.type === 'contact_request'}>
                      <NotifListItem>
                        <ContactNotif info={info} type={activeBox.name} />
                      </NotifListItem>
                    </RenderIf>
                  </Fragment>
                );
              })}
            </RenderIf>
          </ul>
        </RenderIf>
      </main>
    </div>
  );
}
