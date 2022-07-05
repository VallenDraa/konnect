import { Fragment, useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ModalContext } from '../../context/modal/modalContext';
import { UserContext } from '../../context/user/userContext';
import { MyProfileModalContent } from '../Modal/Content/MyProfileModalContent/MyProfileModalContent';
import { OthersProfileModalContent } from '../Modal/Content/OthersProfileModalContent/OthersProfileModalContent';
import NotifBadge from '../NotifBadge/NotifBadge';
import MODAL_ACTIONS from '../../context/modal/modalActions';
import { NotificationsContext } from '../../context/notifications/notificationsContext';

export const Menu = ({ menus, activeMenuState, urlHistory }) => {
  const { activeMenu, setActiveMenu } = activeMenuState;
  const location = useLocation();
  const { modalDispatch } = useContext(ModalContext);
  const { userState } = useContext(UserContext);
  const { notifications } = useContext(NotificationsContext);

  // check if the pathname is heading for a user profile
  useEffect(() => {
    const { pathname, search } = location;
    if (pathname.includes('/user')) {
      const usernamePath = pathname.split('/')[2];

      // check if the target user is the current logged in user
      if (usernamePath !== userState.user.username) {
        setActiveMenu('search');
        modalDispatch({
          type: MODAL_ACTIONS.show,
          prevUrl: urlHistory?.current,
          onExitReturnToHome: false,
          content: <OthersProfileModalContent username={usernamePath} />,
        });
      } else {
        modalDispatch({
          type: MODAL_ACTIONS.show,
          prevUrl: urlHistory?.current,
          onExitReturnToHome: false,
          content: <MyProfileModalContent />,
        });
      }
    }
  }, [location]);

  // to change the active menu according to the current URL path
  useEffect(() => {
    const newActiveMenu = location.pathname.split('/')[1];

    setActiveMenu(newActiveMenu || 'chats');
  }, [location]);

  const NotifBadgeSwitcher = ({ menuName }) => {
    switch (menuName) {
      case 'chats':
        return;
      case 'contacts':
        return;
      case 'search':
        return;
      case 'notifications':
        const totalNotifs = Object.entries(notifications).reduce(
          (prev, [type, { inbox, outbox }], i) => {
            let { inboxLen, outboxLen } = prev;

            return {
              inboxLen: inbox[i]
                ? !inbox[i].seen
                  ? inboxLen++
                  : inboxLen
                : inboxLen,
              outboxLen: outbox[i]
                ? !outbox[i].seen
                  ? outboxLen++
                  : outboxLen
                : outboxLen,
              total: inboxLen + outboxLen,
            };
          },
          { inboxLen: 0, outboxLen: 0, total: 0 }
        );
        return (
          <NotifBadge
            isActive={
              totalNotifs.total !== 0 && typeof totalNotifs.total === 'number'
            }
          >
            {totalNotifs.total <= 99 ? totalNotifs.total : '99+'}
          </NotifBadge>
        );

      default:
        break;
    }
  };

  const linkSwitcher = (menuName) => {
    if (menuName === 'notifications') {
      return '/notifications?box=inbox';
    } else {
      return `/${menuName}`;
    }
  };

  return (
    <ul className="flex justify-evenly gap-2">
      {menus.map((menu, i) => (
        <Fragment key={i}>
          <li
            onClick={() => setActiveMenu(menu.name)}
            className={`basis-1/4 text-xxs w-full 
              ${
                activeMenu === menu.name
                  ? 'text-blue-500'
                  : 'text-gray-500 hover:text-blue-300'
              } p-1 rounded-lg duration-200 cursor-pointer`}
          >
            <Link
              to={`${linkSwitcher(menu.name)}`}
              className="cursor-pointer flex flex-col items-center gap-1 relative w-full h-full"
            >
              <menu.icon className="text-lg" />

              <NotifBadgeSwitcher menuName={menu.name} />

              <span className="capitalize">{menu.name}</span>
            </Link>
          </li>
        </Fragment>
      ))}
    </ul>
  );
};
