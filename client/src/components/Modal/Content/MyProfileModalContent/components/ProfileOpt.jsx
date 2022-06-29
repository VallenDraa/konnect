import { useContext, useEffect, useId, useState } from 'react';
import { UserContext } from '../../../../../context/user/userContext';
import { BiHappyHeartEyes } from 'react-icons/bi';
import { FaCamera } from 'react-icons/fa';
import { FiSave } from 'react-icons/fi';
import { ImBlocked, ImPencil } from 'react-icons/im';
import Pill from '../../../../Buttons/Pill';
import Input from '../../../../Input/Input';
import RenderIf from '../../../../../utils/React/RenderIf';
import ContactsSwiperCard from '../../../../../utils/ContactsSwiperCard/ContactsSwiperCard';
import api from '../../../../../utils/apiAxios/apiAxios';

const ProfileOpt = () => {
  const imageId = useId();
  const { userState } = useContext(UserContext);
  const [contactsPreview, setContactsPreview] = useState();
  const [isEditMode, setIsEditMode] = useState(false);
  const [status, setStatus] = useState(userState.user.status || '');
  const [username, setUsername] = useState(userState.user.username);

  // get contacts preview
  useEffect(() => {
    const getContactsPreview = async () => {
      const contacts = userState.user.contacts;
      const contactIds = contacts.map((contact) => contact.user);

      try {
        const { data } = await api.post('/query/user/get_users_preview', {
          userIds: contactIds,
        });
        const result = data.map(({ profilePicture, initials, username }) => ({
          user: { initials, username, profilePicture },
        }));
        setContactsPreview(result);
      } catch (error) {
        console.log(error);
      }
    };

    getContactsPreview();
  }, [userState]);

  return (
    <form className="w-full overflow-y-hidden space-y-10">
      <main className="shadow-inner">
        <div className="w-full bg-white overflow-y-auto flex flex-col">
          {/* profile pic */}
          <header className="flex flex-col items-center justify-center w-full group bg-gradient-to-br from-blue-200 via-blue-400 to-pink-400 h-[210px]">
            <div className="relative">
              <RenderIf conditionIs={isEditMode}>
                <label
                  htmlFor={imageId}
                  className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-gray-100 gap-1 duration-200 cursor-pointer"
                >
                  <FaCamera className="text-2xl" />
                  <span className="text-xs font-semibold">Change Picture</span>
                </label>
              </RenderIf>
              <input type="file" id={imageId} className="hidden" />
              {/* image preview */}
              <img
                src="https://picsum.photos/200/200"
                alt=""
                className="text-5xl font-bold uppercase rounded-full aspect-square grid place-items-center shadow-md h-[160px]"
              />
            </div>
          </header>

          {/* user data */}
          <footer className="py-3 space-y-8">
            <header
              style={{ flexWrap: isEditMode ? 'wrap-reverse' : 'nowrap' }}
              className="flex  justify-between items-center gap-1 px-5"
            >
              {/* username */}
              <div className="flex grow flex-col gap-y-3">
                {/* username and date joined */}
                <header className="flex gap-x-2 items-center">
                  <h2 className="text-3xl font-semibold mt-2">
                    {userState.user.username}
                  </h2>
                  {/* date joined */}
                  <span className="text-xxs text-gray-400 font-medium">
                    EST.{' '}
                    {new Date(userState.user.createdAt).toLocaleDateString()}
                  </span>
                </header>

                {/* full name */}
                <footer className="flex flex-col space-y-1">
                  <RenderIf
                    conditionIs={
                      userState.user.firstName !== '' ||
                      userState.user.lastName !== ''
                    }
                  >
                    <h3 className="text-xs font-semibold text-gray-400">
                      Full Name :
                    </h3>
                    <span className="text-base">
                      {userState.user.firstName} {userState.user.lastName}
                    </span>
                  </RenderIf>
                  <RenderIf
                    conditionIs={
                      userState.user.firstName !== '' ||
                      userState.user.lastName !== '' ||
                      isEditMode
                    }
                  >
                    <span className="text-xs font-semibold text-gray-400">
                      Full Name :
                    </span>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-1">
                      {/* first name */}
                      <Input
                        className="basis-1/2 text-sm"
                        type="text"
                        placeholder={'Edit First Name'}
                      />
                      {/* last name */}
                      <Input
                        className="basis-1/2 text-sm"
                        type="text"
                        placeholder={'Edit Last Name'}
                      />
                    </div>
                  </RenderIf>
                </footer>
              </div>
              {/* buttons */}
              <div
                style={{
                  gap: isEditMode ? '0.5rem' : '0',
                  width: isEditMode ? '100%' : '65%',
                }}
                className="flex h-full justify-end"
              >
                <Pill
                  onClick={() => setIsEditMode(!isEditMode)}
                  style={{ width: isEditMode ? '50%' : '120px' }}
                  className="text-sm px-4 py-1 font-bold hover:bg-pink-400 active:bg-pink-500 hover:text-white flex items-center gap-x-2"
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
                  style={{
                    cursor: isEditMode ? 'pointer' : 'default',
                    padding: isEditMode ? '0.25rem 1rem' : '0',
                    borderWidth: isEditMode ? '2px' : '0',
                    opacity: isEditMode ? '1' : '0',
                    width: isEditMode ? '50%' : '0%',
                  }}
                  className="text-sm font-bold hover:bg-blue-400 active:bg-blue-500 hover:text-white flex items-center gap-x-2"
                >
                  <FiSave />
                  Save
                </Pill>
              </div>
            </header>
            <main className="space-y-5">
              {/* user status */}
              <div className="px-5">
                <Input
                  label="Status"
                  type="text"
                  disabled={true}
                  icon={<BiHappyHeartEyes className="text-lg" />}
                  value={userState.user.status || 'Unset'}
                />
              </div>

              {/* friends with */}
              <div className="space-y-3">
                <h2 className="text-lg font-medium text-gray-400 px-5">
                  Contacts:
                </h2>
                {/* swiper */}

                <RenderIf conditionIs={userState.user.contacts}>
                  <ContactsSwiperCard contacts={contactsPreview} />
                </RenderIf>
              </div>
            </main>
          </footer>
        </div>
      </main>
    </form>
  );
};

export default ProfileOpt;
