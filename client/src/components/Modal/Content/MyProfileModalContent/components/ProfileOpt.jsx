import { useContext, useEffect, useId, useState } from 'react';
import { UserContext } from '../../../../../context/user/userContext';

import { BiHappyHeartEyes } from 'react-icons/bi';
import { FaCamera } from 'react-icons/fa';
import { FiSave } from 'react-icons/fi';
import { ImProfile, ImBlocked, ImPencil } from 'react-icons/im';
import Pill from '../../../../Buttons/Pill';
import Input from '../../../../Input/Input';
import RenderIf from '../../../../../utils/React/RenderIf';
import ContactsSwiperCard from '../../../../../utils/ContactsSwiperCard/ContactsSwiperCard';
import api from '../../../../../utils/apiAxios/apiAxios';
import USER_ACTIONS from '../../../../../context/user/userAction';
import { MiniModalContext } from '../../../../../context/miniModal/miniModalContext';
import MINI_MODAL_ACTIONS from '../../../../../context/miniModal/miniModalActions';
import PasswordConfirmation from '../../../../MiniModal/content/AccountOpt/PasswordConfirmation';

const ProfileOpt = () => {
  const imageId = useId();
  const { userState, userDispatch } = useContext(UserContext);
  const [contactsPreview, setContactsPreview] = useState();
  const [isEditMode, setIsEditMode] = useState(false);
  const [firstName, setFirstName] = useState(userState.user.firstName || '');
  const [lastName, setLastName] = useState(userState.user.lastName || '');
  const [status, setStatus] = useState(userState.user.status || 'unset');
  const { miniModalState, miniModalDispatch } = useContext(MiniModalContext);

  // get contacts preview
  useEffect(() => {
    const getContactsPreview = async () => {
      const contacts = userState.user.contacts;
      const contactIds = contacts.map((contact) => contact.user);

      try {
        const { data } = await api.post('/query/user/get_users_preview', {
          token: sessionStorage.getItem('token'),
          userIds: contactIds,
        });
        const result = data.map(({ profilePicture, initials, username }) => ({
          user: { initials, username, profilePicture },
        }));

        // console.log(result);
        setContactsPreview(result);
      } catch (error) {
        console.log(error);
      }
    };

    getContactsPreview();
  }, [userState]);

  useEffect(() => {
    if (isEditMode) {
      status === 'unset' && setStatus('');
    } else {
      userState.user.status === '' && setStatus('unset');
      if (firstName !== '' && userState.user.firstName === '') setFirstName('');
      if (lastName !== '' && userState.user.lastName === '') setLastName('');
    }
  }, [isEditMode]);

  const handleUserEdit = async (password, payload) => {
    try {
      userDispatch({ type: USER_ACTIONS.updateStart });
      const { data } = await api.put('/user/edit_profile', {
        password,
        ...payload,
      });

      if (data.success) {
        sessionStorage.setItem('token', data.token);
        userDispatch({ type: USER_ACTIONS.updateSuccess, payload: data.user });
        setIsEditMode(false);
        miniModalDispatch({ type: MINI_MODAL_ACTIONS.closing });
      } else {
        userDispatch({ type: USER_ACTIONS.updateFail, payload: data.message });
      }
    } catch (error) {
      userDispatch({ type: USER_ACTIONS.updateFail, payload: error });
      console.log(error);
    }
  };

  const handleMiniModalPwConfirm = (e) => {
    e.preventDefault();

    const payload = {
      firstName,
      lastName,
      status,
      token: sessionStorage.getItem('token'),
    };

    if (!miniModalState.isActive) {
      miniModalDispatch({
        type: MINI_MODAL_ACTIONS.show,
        payload: (
          <PasswordConfirmation
            cb={handleUserEdit}
            title="Enter Password"
            caption="Enter your password to edit your profile"
            payload={payload}
          />
        ),
      });
    }
  };

  return (
    <form
      onSubmit={(e) => handleMiniModalPwConfirm(e)}
      className="w-full overflow-y-hidden space-y-10"
    >
      <main className="shadow-inner">
        <div className="w-full bg-white overflow-x-hidden overflow-y-auto flex flex-col">
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
              {/* username and date joined */}
              <div className="flex grow flex-wrap-reverse items-center">
                <h2 className="text-4xl md:text-3xl font-semibold mt-2 min-w-[70px] max-w-[99%]">
                  {userState.user.username}
                </h2>
                {/* date joined */}
                <span className="text-xxs text-gray-400 font-medium">
                  EST. {new Date(userState.user.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* buttons */}
              <div
                style={{
                  gap: isEditMode ? '0.5rem' : '0',
                  width: isEditMode ? '100%' : '50%',
                }}
                className="flex h-full justify-end"
              >
                <Pill
                  onClick={() => setIsEditMode(!isEditMode)}
                  style={{ width: isEditMode ? '50%' : '100px' }}
                  className={`text-sm px-4 py-1 font-bold flex items-center gap-x-2
                  ${
                    !isEditMode
                      ? 'hover:bg-pink-400 active:bg-pink-500 hover:text-white'
                      : 'bg-gray-300 text-gray-600 hover:bg-gray-400 hover:text-gray-100'
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
              {/* fullname */}
              <div className="px-5">
                {/* for editing */}
                <RenderIf conditionIs={isEditMode}>
                  <span className="text-xs font-semibold text-gray-400">
                    Full Name :
                  </span>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-x-1 gap-y-5">
                    {/* first name */}
                    <Input
                      required={false}
                      customState={[firstName, setFirstName]}
                      className="basis-1/2 text-base md:text-sm"
                      type="text"
                      placeholder={'Edit First Name'}
                    />
                    {/* last name */}
                    <Input
                      required={false}
                      customState={[lastName, setLastName]}
                      className="basis-1/2 text-base md:text-sm"
                      type="text"
                      placeholder={'Edit Last Name'}
                    />
                  </div>
                </RenderIf>

                {/* for preview */}
                <RenderIf conditionIs={!isEditMode}>
                  <RenderIf
                    conditionIs={
                      userState.user.firstName !== '' ||
                      userState.user.lastName !== ''
                    }
                  >
                    <h3 className="flex items-center gap-x-1 mb-2 text-xs font-semibold text-gray-400">
                      <ImProfile className="text-xxs" />
                      Full Name :
                    </h3>
                    <span className="text-base text-gray-600 font-semibold px-2">
                      {userState.user.firstName} {userState.user.lastName}
                    </span>
                  </RenderIf>
                </RenderIf>
              </div>

              {/* user status */}
              <div className="px-5">
                <RenderIf conditionIs={isEditMode}>
                  <Input
                    labelActive={true}
                    placeholder={'Edit Status'}
                    required={false}
                    label="Status"
                    type="text"
                    customState={[status, setStatus]}
                    style={{ fontSize: '24px' }}
                    icon={<BiHappyHeartEyes className="text-lg" />}
                  />
                </RenderIf>
                <RenderIf conditionIs={!isEditMode}>
                  <h3 className="flex items-center gap-x-1 mb-2 text-xs font-semibold text-gray-400 relative -left-[2px]">
                    <BiHappyHeartEyes className="text-sm" />
                    Status :
                  </h3>
                  <span className="text-base text-gray-600 font-semibold px-2">
                    {status}
                  </span>
                </RenderIf>
              </div>

              {/* friends with */}
              <div className="space-y-3 border-t-2 pt-3">
                <h2 className="text-lg font-medium text-gray-400 mx-5">
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
