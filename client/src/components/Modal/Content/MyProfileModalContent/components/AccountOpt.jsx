import { useContext, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { HiOutlineMail } from 'react-icons/hi';
import { BiRename } from 'react-icons/bi';
import { RiPassportLine } from 'react-icons/ri';
import { MdSecurity } from 'react-icons/md';
import { UserContext } from '../../../../../context/user/userContext';
import Pill from '../../../../Buttons/Pill';
import Input from '../../../../Input/Input';
import { MiniModalContext } from '../../../../../context/miniModal/miniModalContext';
import { useEffect } from 'react';
import MINI_MODAL_ACTIONS from '../../../../../context/miniModal/miniModalActions';
import PasswordConfirmation from '../../../../MiniModal/content/AccountOpt/PasswordConfirmation';

const AccountOpt = () => {
  const { userState } = useContext(UserContext);
  const [email, setEmail] = useState(userState.user.email);
  const [username, setUsername] = useState(userState.user.username);
  const { miniModalState, miniModalDispatch } = useContext(MiniModalContext);

  const submitChanges = (password, payload) => {
    console.log(payload, password);
  };

  const handleMiniModalPwConfirm = () => {
    if (username === userState.user.username) return;
    const payload = { username };

    if (!miniModalState.isActive) {
      miniModalDispatch({
        type: MINI_MODAL_ACTIONS.show,
        payload: (
          <PasswordConfirmation
            cb={submitChanges}
            title="Enter Password To Edit Account"
            payload={payload}
          />
        ),
      });
    }
  };

  return (
    <div>
      <ul className="space-y-10 p-3">
        {/* security */}
        <li className="border-b-2 w-full">
          <h2 className="font-semibold flex items-center gap-2 text-gray-500 text-xs mb-2">
            <MdSecurity />
            Security
          </h2>
          <ul className="w-full overflow-y-hidden flex flex-col divide-y-2">
            {/* email */}
            <li className="flex flex-col justify-between w-full hover:bg-gray-100 p-3 duration-200">
              <span className="flex items-center gap-2 font-semibold text-sm">
                <HiOutlineMail />
                Email
              </span>
              <Input
                style={{ cursor: 'not-allowed' }}
                type="email"
                disabled={true}
                labelActive={true}
                label=""
                customState={[email, setEmail]}
              />
            </li>
          </ul>
        </li>
        {/* personal data */}
        <li className="border-b-2 w-full">
          <h2 className="font-semibold flex items-center gap-2 text-gray-500 text-xs mb-2">
            <RiPassportLine />
            Personal Data
          </h2>
          <ul className="w-full overflow-y-hidden flex flex-col divide-y-2">
            {/* username */}
            <li className="flex flex-col justify-between w-full hover:bg-gray-100 p-3 duration-200">
              <span className="flex items-center gap-2 font-semibold text-sm">
                <BiRename />
                Username
              </span>
              <Input
                required={true}
                type="text"
                labelActive={true}
                label=""
                customState={[username, setUsername]}
              />
            </li>
          </ul>
        </li>
        {/* submit */}
        <li>
          <Pill
            onClick={handleMiniModalPwConfirm}
            type="submit"
            className="pointer py-1 px-4 border-2 text-sm font-bold bg-gray-400 hover:bg-blue-400 active:bg-blue-500 text-white flex items-center gap-x-2"
          >
            <FiSave />
            Save
          </Pill>
        </li>
      </ul>
    </div>
  );
};

export default AccountOpt;
