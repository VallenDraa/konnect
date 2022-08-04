import { useEffect, useContext, useState, Fragment } from "react";
import { MdOutlineMoveToInbox, MdOutlineOutbox } from "react-icons/md";
import { UserContext } from "../../../../context/user/userContext";
import RenderIf from "../../../../utils/React/RenderIf";
import api from "../../../../utils/apiAxios/apiAxios";
import Dropdown from "../../../Dropdown/Dropdown";
import DropdownItem from "../../../Dropdown/DropdownItem/DropdownItem";
import NotifListItem from "./NotifListItem/NotifListItem";
import ContactNotif from "./type/ContactNotif/ContactNotif";
import { useLocation } from "react-router-dom";
import { NotifContext } from "../../../../context/notifContext/NotifContext";
import NOTIF_CONTEXT_ACTIONS from "../../../../context/notifContext/notifContextActions";
import { cloneDeep } from "lodash";

export default function NotificationList() {
  const NOTIFICATION_TABS = [
    { name: "inbox", icon: MdOutlineMoveToInbox },
    { name: "outbox", icon: MdOutlineOutbox },
  ];
  const [activeBox, setActiveBox] = useState(NOTIFICATION_TABS[0]);
  const { notifs, notifsDispatch } = useContext(NotifContext);
  const { userState } = useContext(UserContext);
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
    if (activeLocation.pathname !== "/notifications") return;

    const search = Object.fromEntries(
      activeLocation.search
        .replace("?", "")
        .split("&")
        .map((s) => s.split("="))
    );

    const targetBox = NOTIFICATION_TABS.find((n) => n.name === search.box);

    setActiveBox(targetBox || NOTIFICATION_TABS[0]);
  }, [activeLocation]);

  // if user selected one of the box, then set all the contents of that box to seen
  useEffect(() => {
    const currentUrl = location.pathname + location.search;
    if (!currentUrl.includes("notifications")) return;
    if (!currentUrl.includes(activeBox.name)) return;

    const updateNotifSeen = async ({ boxType, notifIds, userId }) => {
      // update the seen status to the database
      const { data } = await api.put(
        "/notification/set_notif_to_seen",
        { notifIds, boxType, userId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
    };

    const { name } = activeBox;
    const toBeSeenNotifIds = []; // the notif ids whose seen parameter will be changed to true
    const updatedNotifs = cloneDeep(notifs.content);

    // loop over the notif contents to update the seen status locally and also to pick the ids whose seen status will be updated in the database
    for (const i in updatedNotifs[name]) {
      if (!updatedNotifs[name][i].seen) {
        toBeSeenNotifIds.push(updatedNotifs[name][i]._id);
        updatedNotifs[name][i].seen = true;
      }
    }

    if (toBeSeenNotifIds.length > 0) {
      // will reach for the api if the toBeSeenNotifIds is not empty
      try {
        updateNotifSeen({
          boxType: name,
          notifIds: toBeSeenNotifIds,
          userId: userState.user._id,
        });
        notifsDispatch({
          type: NOTIF_CONTEXT_ACTIONS.loaded,
          payload: updatedNotifs,
        });
      } catch (error) {
        notifsDispatch({ type: NOTIF_CONTEXT_ACTIONS.error, payload: error });
      }
    }
  }, [activeBox, userState, notifs, location]);

  return (
    <div className="p-3 space-y-3">
      <header>
        <nav className="relative w-fit">
          <Dropdown
            offset={8}
            fontSize={12}
            icon={activeBox.icon()}
            text={activeBox.name}
            position={"origin-top-left left-0"}
          >
            {NOTIFICATION_TABS.map((tab) => (
              <DropdownItem
                key={tab.name}
                onClick={() => setActiveBox(tab)}
                to={`/notifications?box=${tab.name}`}
                isActive={tab.name === activeBox.name}
                className="flex items-center gap-x-1"
              >
                {tab.icon({ className: "text-sm" })}
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
          <ul
            className={`${
              notifs?.content[activeBox.name]?.length === 0 ? "" : "border-t-2"
            }`}
          >
            {/* if there are no notifications */}
            <RenderIf
              conditionIs={notifs?.content[activeBox.name]?.length === 0}
            >
              <li className="text-center space-y-10 mt-10 py-4">
                <span className="block font-semibold text-xl lg:text-lg text-gray-500">
                  <RenderIf conditionIs={activeBox.name === "inbox"}>
                    Inbox is empty
                  </RenderIf>
                  <RenderIf conditionIs={activeBox.name === "outbox"}>
                    Outbox is empty
                  </RenderIf>
                </span>
                <span className="font-light text-gray-400 text-xs">
                  Something will show up eventually ...
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
                    <RenderIf conditionIs={info.type === "contact_request"}>
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
