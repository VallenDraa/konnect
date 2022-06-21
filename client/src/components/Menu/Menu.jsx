import { useContext, useEffect } from 'react';
import { Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import { ModalContext } from '../../context/modal/modalContext';
import MODAL_ACTIONS from '../../context/modal/modalActions';
import { UserContext } from '../../context/user/userContext';
import { MyProfileModalContent } from '../Modal/Content/MyProfileModalContent/MyProfileModalContent';
import { OthersProfileModalContent } from '../Modal/Content/OthersProfileModalContent/OthersProfileModalContent';
import NotifBadge from '../NotifBadge/NotifBadge';
import RenderIf from '../../utils/React/RenderIf';
import { NotificationsContext } from '../../context/notifications/notificationsContext';

export const Menu = ({ menus, activeMenuState }) => {
  const { activeMenu, setActiveMenu } = activeMenuState;
  const location = useLocation();
  const { modalDispatch } = useContext(ModalContext);
  const { userState } = useContext(UserContext);
  const { notifications } = useContext(NotificationsContext);

  // check if the pathname is heading for a user profile
  useEffect(() => {
    const { pathname } = location;
    if (pathname.includes('/user')) {
      const username = pathname.split('/')[2];

      // check if the target user is the current logged in user
      if (username !== userState.user.username) {
        setActiveMenu('search');
        modalDispatch({
          type: MODAL_ACTIONS.show,
          onExitReturnToHome: true,
          pathname: `/user/${username}`,
          content: <OthersProfileModalContent username={username} />,
        });
      } else {
        modalDispatch({
          type: MODAL_ACTIONS.show,
          onExitReturnToHome: true,
          pathname: `/user/${userState.user.username}`,
          content: <MyProfileModalContent />,
        });
      }
    }
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
          (prev, [type, not]) => {
            return prev + not.inbox.length + not.outbox.length;
          },
          0
        );

        return (
          <NotifBadge isActive={totalNotifs !== 0}>
            {totalNotifs <= 99 ? totalNotifs : '99+'}
          </NotifBadge>
        );
      default:
        break;
    }
  };

  return (
    <ul className="flex flex-wrap justify-evenly gap-y-2">
      {menus.map((menu, i) => (
        <Fragment key={i}>
          <li
            onClick={() => setActiveMenu(menu.name)}
            className={`basis-1/4 cursor-pointer flex flex-col items-center gap-1 text-xxs w-full 
              ${
                activeMenu === menu.name
                  ? 'text-blue-400'
                  : 'text-gray-500 hover:text-blue-400'
              } p-1 rounded-lg duration-200 relative`}
          >
            <menu.icon className="text-lg" />

            <NotifBadgeSwitcher menuName={menu.name} />

            <span className="capitalize">{menu.name}</span>
          </li>
        </Fragment>
      ))}
    </ul>
  );
};
