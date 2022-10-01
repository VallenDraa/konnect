import _ from "lodash";
import PP from "../../../PP/PP";
import ContactsSwiperCard from "../../../../utils/ContactsSwiperCard/ContactsSwiperCard";
import FloatingContextMenu from "../../../FloatingContextMenu/FloatingContextMenu";
import { CachedUserContext } from "../../../../context/cachedUser/CachedUserContext";
import { useEffect, useContext, useState, useRef } from "react";
import { BiLogOut, BiRename } from "react-icons/bi";
import { FCMContext } from "../../../../context/FCMContext/FCMContext";
import { BsTextParagraph, BsThreeDotsVertical } from "react-icons/bs";
import GroupModalFCMItem from "../../../FloatingContextMenu/Content/GroupModalFCMItem";
import Pill from "../../../Buttons/Pill";
import RenderIf from "../../../../utils/React/RenderIf";
import { ImBlocked, ImPencil } from "react-icons/im";
import { FiSave } from "react-icons/fi";
import { UserContext } from "../../../../context/user/userContext";
import Input from "../../../Input/Input";
import { FaTrashAlt } from "react-icons/fa";
import { MiniModalContext } from "../../../../context/miniModal/miniModalContext";
import PasswordConfirmation from "../../../MiniModal/content/AccountOpt/PasswordConfirmation";
import MINI_MODAL_ACTIONS from "../../../../context/miniModal/miniModalActions";
import socket from "../../../../utils/socketClient/socketClient";
import { ActiveGroupChatContext } from "../../../../context/activeGroupChat/ActiveGroupChatContext";
import { MessageLogsContext } from "../../../../context/messageLogs/MessageLogsContext";
import { SettingsContext } from "../../../../context/settingsContext/SettingsContext";
import Dropdown from "../../../Dropdown/Dropdown";
import DropdownItem from "../../../Dropdown/DropdownItem/DropdownItem";
import { IoPersonAdd } from "react-icons/io5";
import NormalConfirmation from "../../../MiniModal/content/NormalConfirmation";
import MoreMenu from "./components/MoreMenu";

export default function GroupProfileModalContent() {
  const adminsListRef = useRef();
  const membersListRef = useRef();
  const { userState } = useContext(UserContext);
  const { fetchCachedUsers } = useContext(CachedUserContext);
  const [adminsData, setAdminsData] = useState([]);
  const [membersData, setMembersData] = useState([]);
  const {
    closeContextMenuOnClick,
    FCMWrapperRef,
    closeContextMenu,
    openContextMenu,
  } = useContext(FCMContext);
  const { activeGroupChat } = useContext(ActiveGroupChatContext);
  const { msgLogs } = useContext(MessageLogsContext);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [description, setDescription] = useState(
    msgLogs.content[activeGroupChat].description || ""
  );
  const [groupName, setGroupName] = useState(
    msgLogs.content[activeGroupChat].name
  );
  const { miniModalState, miniModalDispatch } = useContext(MiniModalContext);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const [hasQuitGroup, setHasQuitgroup] = useState(
    activeGroupChat &&
      msgLogs.content[activeGroupChat].hasQuit.some(
        (u) => u.user === userState.user._id
      )
  );

  // for handling whether the user has quit or been kicked
  useEffect(() => {
    setHasQuitgroup(
      activeGroupChat &&
        msgLogs.content[activeGroupChat].hasQuit.some(
          (u) => u.user === userState.user._id
        )
    );
  }, [activeGroupChat, msgLogs.content]);

  // mapping the admins data for the lists
  useEffect(() => {
    (async () => {
      try {
        const admins = await fetchCachedUsers(
          msgLogs.content[activeGroupChat].admins
        );

        setAdminsData(admins.map((admin) => ({ user: { ...admin } })));
      } catch (error) {
        console.log(error);
      }
    })();
  }, [msgLogs.content[activeGroupChat].admins]);

  // mapping the members data for the lists
  useEffect(() => {
    (async () => {
      try {
        const members = await fetchCachedUsers(
          msgLogs.content[activeGroupChat].members
        );
        setMembersData(members.map((member) => ({ user: { ...member } })));
      } catch (error) {
        console.log(error);
      }
    })();
  }, [msgLogs.content[activeGroupChat].members]);

  // determining if the user is admin
  useEffect(() => {
    setIsAdmin(adminsData.some((a) => a.user._id === userState.user._id));
  }, [adminsData, userState.user]);

  // to close the floating context menu when profile is closed
  useEffect(() => () => closeContextMenu(), []);

  // EDIT GROUP
  const resetEditValue = () => {
    const { name, description } = msgLogs.content[activeGroupChat];

    if (groupName !== name) setGroupName(name);
    if (description !== description) setDescription(description);
  }; // resetting the edit value back to the unedited value
  const submitChanges = async (password, payload) => {
    // emit a socket event to save edits and broadcast the change to the other members
    try {
      socket.emit("edit-group", { ...payload, userPw: password });

      // close the mini modal and disable edit mode
      setIsEditMode(false);
      miniModalDispatch({ type: MINI_MODAL_ACTIONS.closing });
      miniModalDispatch({ type: MINI_MODAL_ACTIONS.closed });
    } catch (error) {
      console.log(error);
    }
  }; // show password mini modal for group edit confirmation
  const handleEdits = () => {
    const payload = {
      _id: msgLogs.content[activeGroupChat].chatId,
      newName: groupName,
      newDesc: description,
      token: sessionStorage.getItem("token"),
    };

    if (!miniModalState.isActive) {
      miniModalDispatch({
        type: MINI_MODAL_ACTIONS.show,
        payload: {
          content: (
            <PasswordConfirmation
              cb={submitChanges}
              title="Enter Your Password To Edit The Group"
              caption="Changes will be broadcasted to other members"
              payload={payload}
            />
          ),
        },
      });
    }
  };

  // DELETE GROUP
  const deleteGroupInDb = (password, payload) => {
    console.log(password, payload);
  }; // show password mini modal for group deletion confirmation
  const handleDeleteGroup = () => {
    const payload = {
      _id: msgLogs.content[activeGroupChat].chatId,
      token: sessionStorage.getItem("token"),
    };

    if (!miniModalState.isActive) {
      miniModalDispatch({
        type: MINI_MODAL_ACTIONS.show,
        payload: {
          content: (
            <PasswordConfirmation
              cb={deleteGroupInDb}
              title="Enter Your Password To Delete The Group"
              caption="All data regarding this group will be wiped"
              payload={payload}
            />
          ),
        },
      });
    }
  };

  // handling auto context menu auto close
  const handleFCMAutoClose = (e) => {
    if (!e.target.getAttribute("data-user-card")) closeContextMenuOnClick(e);
  };

  return (
    <section
      ref={FCMWrapperRef}
      className="w-screen lg:w-[40rem] h-full flex flex-col"
      onClick={handleFCMAutoClose}
      aria-label="Group Profile"
    >
      <FloatingContextMenu>
        <GroupModalFCMItem user={activeUser} />
      </FloatingContextMenu>
      <div className="grow shadow-md lg:shadow-inner">
        <div
          onScroll={closeContextMenu}
          className="w-full min-h-full h-0 bg-white overflow-y-auto flex flex-col container max-w-screen-sm mx-auto"
        >
          {/* profile pic */}
          <header className="bg-gradient-to-br from-blue-200 via-blue-400 to-pink-400 py-4">
            <PP
              src={msgLogs.content[activeGroupChat].profilePicture || null}
              alt={msgLogs.content[activeGroupChat].name}
              type="group"
              className="rounded-full h-44 mx-auto"
            />
          </header>
          {/* group data */}
          <footer className="py-3 space-y-8">
            <header
              className="flex flex-wrap justify-between items-center gap-3 px-5"
              style={{ flexDirection: isEditMode ? "column-reverse" : "" }}
            >
              {/* group name */}
              <RenderIf conditionIs={!isEditMode}>
                <div className="flex gap-x-2 items-center self-center">
                  <span className="text-3xl font-semibold mt-2">
                    {msgLogs.content[activeGroupChat].name}
                  </span>
                  {/* date created */}
                  <span className="text-xxs text-gray-400 font-medium">
                    EST.{" "}
                    {new Date(
                      msgLogs.content[activeGroupChat].createdAt
                    ).toLocaleDateString()}
                  </span>
                </div>
              </RenderIf>
              {/* edit group name */}
              <RenderIf conditionIs={isEditMode}>
                <Input
                  required={false}
                  value={groupName}
                  customState={[groupName, setGroupName]}
                  className="basis-1/2 text-base lg:text-sm"
                  type="text"
                  placeholder={"Edit Group Name"}
                  label="Group Name"
                  labelActive={true}
                  icon={<BiRename className="text-sm" />}
                />
              </RenderIf>

              {/* buttons */}
              <div
                style={{ width: isEditMode ? "100%" : "" }}
                className="flex h-full self-end justify-end w-full sm:w-max"
              >
                {/* enable edit mode if the user is an admin */}
                <RenderIf conditionIs={isAdmin}>
                  {/* for triggering edit mode and cancelling it */}
                  <Pill
                    onClick={() => {
                      setIsEditMode(!isEditMode);
                      resetEditValue();
                    }}
                    style={{ width: isEditMode ? "50%" : "96px" }}
                    className={`text-sm px-4 py-1 font-bold flex items-center gap-x-1.5
                  ${
                    !isEditMode
                      ? "bg-pink-400 hover:shadow-pink-100 hover:bg-pink-300 text-white"
                      : "bg-gray-300 text-gray-600 hover:bg-gray-400 hover:text-gray-200"
                  }`}
                  >
                    <RenderIf conditionIs={!isEditMode}>
                      <ImPencil />
                      Edit
                    </RenderIf>
                    <RenderIf conditionIs={isEditMode}>
                      <ImBlocked />
                      Cancel
                    </RenderIf>
                  </Pill>

                  {/* for saving edits */}
                  <Pill
                    onClick={handleEdits}
                    disabled={!isEditMode}
                    style={{
                      cursor: isEditMode ? "pointer" : "default",
                      padding: isEditMode ? "0.25rem 1rem" : "0",
                      opacity: isEditMode ? "1" : "0",
                      width: isEditMode ? "50%" : "0%",
                      marginLeft: isEditMode ? "0.5rem" : "",
                    }}
                    className="text-sm font-bold bg-blue-400 hover:bg-blue-300 hover:shadow-blue-100 active:shadow-blue-100 text-white flex items-center gap-x-1.5"
                  >
                    <FiSave />
                    Save
                  </Pill>
                </RenderIf>
                <RenderIf conditionIs={!isEditMode && !hasQuitGroup}>
                  <MoreMenu />
                </RenderIf>
              </div>
            </header>
            <main className="space-y-5">
              {/* user status */}
              <div className="px-5">
                <RenderIf conditionIs={isEditMode}>
                  <Input
                    labelActive={true}
                    placeholder={"Edit Group Description"}
                    required={false}
                    type="text"
                    customState={[description, setDescription]}
                    label="Description"
                    icon={<BsTextParagraph className="text-base" />}
                  />
                </RenderIf>
                <RenderIf conditionIs={!isEditMode}>
                  <h3 className="flex items-center gap-x-1 mb-2 text-xs font-semibold text-gray-400 relative -left-[2px]">
                    <BsTextParagraph className="text-sm" />
                    Group Description :
                  </h3>
                  <span className="text-base text-gray-600 font-semibold px-2">
                    {msgLogs.content[activeGroupChat].description || "-"}
                  </span>
                </RenderIf>
              </div>

              {/* Delete group button for admins  */}
              <RenderIf conditionIs={isAdmin && isEditMode}>
                <div className="mx-5">
                  <Pill
                    onClick={handleDeleteGroup}
                    className="text-sm px-4 py-1 font-bold flex items-center max-w-sm mx-auto gap-x-1.5 border-red-500 bg-red-100 hover:bg-red-500 active:bg-red-500 text-red-400 hover:text-white active:text-white shadow-red-100 hover:shadow-red-200 active:shadow-red-200"
                  >
                    <FaTrashAlt />
                    Delete Group
                  </Pill>
                </div>
              </RenderIf>

              {/* Participants */}
              <div ref={adminsListRef} className="space-y-3 border-t-2 pt-3">
                <span className="text-lg font-medium text-gray-400 px-5">
                  Admins:
                </span>

                <ContactsSwiperCard
                  onItemClicked={(user, e) => {
                    openContextMenu(e);
                    setActiveUser(user);
                  }}
                  linkable={false}
                  contacts={adminsData}
                />
              </div>
              <div ref={membersListRef} className="space-y-3 border-t-2 pt-3">
                <span className="text-lg font-medium text-gray-400 px-5">
                  Members:
                </span>

                <ContactsSwiperCard
                  onItemClicked={(user, e) => {
                    openContextMenu(e);
                    setActiveUser(user);
                  }}
                  linkable={false}
                  contacts={membersData}
                />
              </div>
            </main>
          </footer>
        </div>
      </div>
    </section>
  );
}
