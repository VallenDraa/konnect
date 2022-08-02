import { Fragment, useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ModalContext } from "../../context/modal/modalContext";
import { UserContext } from "../../context/user/userContext";
import { MessageLogsContext } from "../../context/messageLogs/MessageLogsContext";
import { MyProfileModalContent } from "../Modal/Content/MyProfileModalContent/MyProfileModalContent";
import { OthersProfileModalContent } from "../Modal/Content/OthersProfileModalContent/OthersProfileModalContent";
import NotifBadge from "../NotifBadge/NotifBadge";
import MODAL_ACTIONS from "../../context/modal/modalActions";
import RenderIf from "../../utils/React/RenderIf";
import { NotifContext } from "../../context/notifContext/NotifContext";
import { SettingsContext } from "../../context/settingsContext/SettingsContext";
import useCheckMobile from "../../utils/React/hooks/useCheckMobile/useCheckMobile";

export const Menu = ({
  menus,
  activeMenuState,
  urlHistory,
  isMenuNavigateWithBtn,
}) => {
  const { activeMenu, setActiveMenu } = activeMenuState;
  const location = useLocation();
  const { modalDispatch } = useContext(ModalContext);
  const { userState } = useContext(UserContext);
  const { notifs, notifUnseen } = useContext(NotifContext);
  const { msgUnread } = useContext(MessageLogsContext);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const [isMobile] = useCheckMobile();

  // check if the pathname is heading for a user profile
  useEffect(() => {
    const { pathname, search } = location;
    if (pathname.includes("/user")) {
      const usernamePath = pathname.split("/")[2];
      // check if the target user is the current logged in user
      if (usernamePath !== userState.user.username) {
        modalDispatch({
          type: MODAL_ACTIONS.show,
          prevUrl: urlHistory?.current,
          onExitReturnToHome: false,
          content: <OthersProfileModalContent username={usernamePath} />,
          title: `${usernamePath}'s Profile`,
        });
      } else {
        modalDispatch({
          type: MODAL_ACTIONS.show,
          prevUrl: urlHistory?.current,
          onExitReturnToHome: false,
          content: <MyProfileModalContent />,
          title: "Settings",
        });
      }
    }
  }, [location]);

  // to change the active menu according to the current URL path
  useEffect(() => {
    const newActiveMenu = location.pathname.split("/")[1];

    // check if the new active menu is valid
    const isValid = menus.some(({ name }) => name === newActiveMenu);

    if (!isValid) return;
    if (newActiveMenu !== activeMenu) {
      setActiveMenu(newActiveMenu || "chats");
    }
  }, [location]);

  const NotifBadgeSwitcher = ({ menuName }) => {
    switch (menuName) {
      case "chats":
        if (msgUnread) {
          return (
            <NotifBadge
              size={18}
              style={{ right: "5px", top: "-1px" }}
              textOffset={{ right: "0px", top: !isMobile ? "0.5px" : "" }}
              isActive={
                msgUnread.total !== 0 && typeof msgUnread.total === "number"
              }
            >
              {msgUnread.total <= 99 ? msgUnread.total : "99+"}
            </NotifBadge>
          );
        }
        return;
      case "contacts":
        return;
      case "search":
        return;
      case "notifications":
        if (notifUnseen) {
          return (
            <NotifBadge
              isActive={
                notifUnseen.total !== 0 && typeof notifUnseen.total === "number"
              }
              style={{ right: "5px", top: "-1px" }}
              textOffset={{ right: "0px", top: "0px" }}
            >
              {notifUnseen.total <= 99 ? notifUnseen.total : "99+"}
            </NotifBadge>
          );
        }
      default:
        break;
    }
  };

  const linkSwitcher = (menuName) => {
    if (menuName === "notifications") {
      return "/notifications?box=inbox";
    } else {
      return `/${menuName}`;
    }
  };

  return (
    <ul className="flex justify-between divide-gray-300 gap-x-1">
      {menus.map((menu, i) => {
        return (
          <Fragment key={i}>
            <li
              onClick={() => {
                setActiveMenu(menu.name);
                isMenuNavigateWithBtn.current = true;
              }}
              className={`w-[70px] grow text-xxs cursor-pointer rounded-lg ${
                activeMenu === menu.name
                  ? "text-blue-400"
                  : "text-gray-500 hover:text-blue-400"
              } ${general?.animation ? "duration-200" : ""}`}
            >
              <Link
                to={`${linkSwitcher(menu.name)}`}
                className="cursor-pointer flex flex-col items-center gap-1 relative w-full h-full"
              >
                <RenderIf conditionIs={activeMenu !== menu.name}>
                  <menu.icon className="text-2xl lg:text-xl" />
                </RenderIf>
                <RenderIf conditionIs={activeMenu === menu.name}>
                  <menu.activeIcon className="text-2xl lg:text-xl" />
                </RenderIf>

                <NotifBadgeSwitcher menuName={menu.name} />

                <span className="capitalize text-xxs">{menu.name}</span>
              </Link>
            </li>
          </Fragment>
        );
      })}
    </ul>
  );
};
