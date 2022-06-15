import { useContext, useEffect } from 'react';
import { Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import { ModalContext } from '../../context/Modal/modalContext';
import MODAL_ACTIONS from '../../context/Modal/modalActions';
import { UserContext } from '../../context/User/userContext';
import { MyProfileModalContent } from '../Modal/Content/MyProfileModalContent/MyProfileModalContent';
import { OthersProfileModalContent } from '../Modal/Content/OthersProfileModalContent/OthersProfileModalContent';

export const Menu = ({ menus, activeMenuState }) => {
  const { activeMenu, setActiveMenu } = activeMenuState;
  const location = useLocation();
  const { modalDispatch } = useContext(ModalContext);
  const { userState } = useContext(UserContext);

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

  return (
    <ul className="flex justify-evenly divide-x-2">
      {menus.map((menu, i) => (
        <Fragment key={i}>
          <li
            onClick={() => setActiveMenu(menu.name)}
            className={`cursor-pointer flex flex-col items-center gap-1 text-xxs w-full 
              ${
                activeMenu === menu.name
                  ? 'text-blue-400'
                  : 'text-gray-500 hover:text-blue-400'
              } p-1 rounded-lg duration-200`}
          >
            <menu.icon className="text-lg" />
            <span className="capitalize">{menu.name}</span>
          </li>
        </Fragment>
      ))}
    </ul>
  );
};
