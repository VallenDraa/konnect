import _ from "lodash";
import PP from "../../../PP/PP";
import ContactsSwiperCard from "../../../../utils/ContactsSwiperCard/ContactsSwiperCard";
import FloatingContextMenu from "../../../FloatingContextMenu/FloatingContextMenu";
import { CachedUserContext } from "../../../../context/cachedUser/CachedUserContext";
import { useEffect, useContext, useState, useRef } from "react";
import { BiLogOut, BiRename } from "react-icons/bi";
import { FCMContext } from "../../../../context/FCMContext/FCMContext";
import { BsTextParagraph } from "react-icons/bs";
import GroupModalFCMItem from "../../../FloatingContextMenu/Content/GroupModalFCMItem";
import Pill from "../../../Buttons/Pill";
import RenderIf from "../../../../utils/React/RenderIf";
import { ImBlocked, ImParagraphJustify, ImPencil } from "react-icons/im";
import { FiSave } from "react-icons/fi";
import { UserContext } from "../../../../context/user/userContext";
import Input from "../../../Input/Input";

export default function GroupProfileModalContent({ data }) {
  const { userState } = useContext(UserContext);
  const adminsListRef = useRef();
  const membersListRef = useRef();
  const { fetchCachedUsers } = useContext(CachedUserContext);
  const [adminsData, setAdminsData] = useState([]);
  const [membersData, setMembersData] = useState([]);
  const {
    closeContextMenuOnClick,
    FCMWrapperRef,
    closeContextMenu,
    openContextMenu,
  } = useContext(FCMContext);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [description, setDescription] = useState(data?.description);
  const [groupName, setGroupName] = useState(data?.name);

  // mapping the admins data for the lists
  useEffect(() => {
    (async () => {
      try {
        const admins = await fetchCachedUsers(data.admins);

        setAdminsData(admins.map((admin) => ({ user: { ...admin } })));
      } catch (error) {
        console.log(error);
      }
    })();
  }, [data.admins]);

  // mapping the members data for the lists
  useEffect(() => {
    (async () => {
      try {
        const members = await fetchCachedUsers(data.members);
        setMembersData(members.map((member) => ({ user: { ...member } })));
      } catch (error) {
        console.log(error);
      }
    })();
  }, [data.members]);

  // determining if the user is admin
  useEffect(() => {
    setIsAdmin(adminsData.some((a) => a.user._id === userState.user._id));
  }, [adminsData, userState.user]);

  // to close the floating context menu when profile is closed
  useEffect(() => () => closeContextMenu(), []);

  // resetting the edit value back to the unedited value
  const resetEditValue = () => {
    if (groupName !== data?.name) setGroupName(data?.name);
    if (description !== data?.description) setDescription(data?.description);
  };

  return (
    <section
      ref={FCMWrapperRef}
      className="w-screen lg:w-[40rem] h-full flex flex-col"
      onClick={(e) => {
        if (!e.target.getAttribute("data-user-card")) {
          closeContextMenuOnClick(e);
        }
      }}
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
              src={data.profilePicture || null}
              alt={data.name}
              type="group"
              className="rounded-full h-44 mx-auto"
            />
          </header>
          {/* user data */}
          <footer className="py-3 space-y-8">
            <header
              className="flex flex-col sm:flex-row justify-between items-center gap-3 px-5"
              style={{ flexDirection: isEditMode ? "column-reverse" : "row" }}
            >
              {/* group name */}
              <RenderIf conditionIs={!isEditMode}>
                <div className="flex gap-x-2 items-center self-center">
                  <span className="text-3xl font-semibold mt-2">
                    {data.name}
                  </span>
                  {/* date created */}
                  <span className="text-xxs text-gray-400 font-medium">
                    EST. {new Date(data?.createdAt).toLocaleDateString()}
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
                className="gap-2 flex h-full self-end justify-end grow"
              >
                {/* for quitting the group */}
                <RenderIf conditionIs={!isEditMode}>
                  {/* for triggering edit mode and cancelling it */}
                  <Pill className="text-sm px-4 py-1 font-bold flex items-center gap-x-1.5 bg-red-400 hover:shadow-red-100 hover:bg-red-300 text-white w-24">
                    <BiLogOut />
                    Quit
                  </Pill>
                </RenderIf>

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
                    type="submit"
                    disabled={!isEditMode}
                    style={{
                      position: isEditMode ? "static" : "absolute",
                      zIndex: isEditMode ? "" : "-1",
                      cursor: isEditMode ? "pointer" : "default",
                      padding: isEditMode ? "0.25rem 1rem" : "0",
                      opacity: isEditMode ? "1" : "0",
                      width: isEditMode ? "50%" : "0%",
                    }}
                    className="text-sm font-bold bg-blue-400 hover:bg-blue-300 hover:shadow-blue-100 active:shadow-blue-100 text-white flex items-center gap-x-1.5"
                  >
                    <FiSave />
                    Save
                  </Pill>
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
                    {data?.description || "-"}
                  </span>
                </RenderIf>
              </div>

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
