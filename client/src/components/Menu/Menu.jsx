import { Fragment, useCallback, useRef, useContext, useEffect } from "react";
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
import { throttle } from "lodash";

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
  const { activeBox, notifUnseen } = useContext(NotifContext);
  const { msgUnread } = useContext(MessageLogsContext);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const [isMobile] = useCheckMobile();
  const menuUnderlineRef = useRef(null);
  const menuListRef = useRef(null);
  const menuUnderlineLoader = useCallback(
    throttle(() => {
      const { left: pLeft, right: pRight } =
        menuListRef.current.getBoundingClientRect();
      const child = [...menuListRef.current.children].find(
        (c) => c.textContent === activeMenu
      );

      if (child) {
        const { left: cLeft, right: cRight } = child.getBoundingClientRect();

        menuUnderlineRef.current.style.left = `${cLeft - pLeft}px`;
        menuUnderlineRef.current.style.right = `${pRight - cRight}px`;
      }
    }, 200),
    [menuUnderlineRef, activeMenu]
  );

  // check if the pathname is heading for a user profile
  useEffect(() => {
    const { pathname } = location;
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
              textOffset={{ right: "0px", top: "0px" }}
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
    switch (menuName) {
      case "notifications":
        return `/notifications?box=${activeBox.name}`;

      default:
        return `/${menuName}`;
    }
  };

  //MENU SELECTOR RELATED
  useEffect(() => {
    if (!menuListRef.current) return;

    setTimeout(menuUnderlineLoader, 100);
  }, [menuListRef, menuUnderlineLoader, userState._id]); //set the initial menu selector pos

  useEffect(() => {
    window.addEventListener("resize", menuUnderlineLoader);

    return () => window.removeEventListener("resize", menuUnderlineLoader);
  }, [menuUnderlineLoader]); //changing the placement when the screen size change

  const handleMenuSelector = (target) => {
    const { left: pLeft, right: pRight } =
      menuListRef.current.getBoundingClientRect();
    let anchorTag = null;

    if (target.tagName === "A") {
      anchorTag = target;
    } else {
      // loop over until the anchor tag is not null
      let currEl = target;
      while (anchorTag === null) {
        if (currEl.parentElement.tagName !== "A") {
          currEl = currEl.parentElement;
        } else {
          anchorTag = currEl.parentElement;
          currEl = null;
        }
      }
    }

    const { left: cLeft, right: cRight } = anchorTag.getBoundingClientRect();
    const currSelectorStyle = menuUnderlineRef.current.style;

    const newLeftPos = cLeft - pLeft;
    const newRightPos = pRight - cRight;

    currSelectorStyle.left = `${newLeftPos}px`;
    currSelectorStyle.right = `${newRightPos}px`;
  }; //triggers when menu changes

  return (
    <>
      {/* the menu list */}
      <ul
        ref={menuListRef}
        className="flex justify-between divide-gray-300 gap-x-1 relative"
      >
        {menus.map((Menu, i) => {
          return (
            <Fragment key={i}>
              <li
                onClick={(e) => {
                  setActiveMenu(Menu.name);
                  handleMenuSelector(e.target);
                  isMenuNavigateWithBtn.current = true;
                }}
                className={`w-[70px] grow text-xxs cursor-pointer rounded-lg ${
                  activeMenu === Menu.name
                    ? "text-blue-400"
                    : "text-gray-500 hover:text-blue-400"
                } ${general?.animation ? "duration-200" : ""}`}
              >
                <Link
                  to={`${linkSwitcher(Menu.name)}`}
                  className="cursor-pointer flex flex-col items-center gap-1 relative w-full h-full"
                >
                  <RenderIf conditionIs={activeMenu !== Menu.name}>
                    <Menu.icon className="text-2xl lg:text-xl" />
                  </RenderIf>
                  <RenderIf conditionIs={activeMenu === Menu.name}>
                    <Menu.activeIcon className="text-2xl lg:text-xl" />
                  </RenderIf>

                  <NotifBadgeSwitcher menuName={Menu.name} />

                  <span className="capitalize text-xxs">{Menu.name}</span>
                </Link>
              </li>
            </Fragment>
          );
        })}

        {/* the selector */}
        <li
          ref={menuUnderlineRef}
          className={`h-0.5 bg-blue-300 absolute -bottom-1 ${
            general.animation ? "duration-200" : ""
          }`}
          style={{ left: "0px", right: "0px" }}
        />
      </ul>
    </>
  );
};
