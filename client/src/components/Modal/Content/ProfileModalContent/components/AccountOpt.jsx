import { useRef } from 'react';
import { FiSave } from 'react-icons/fi';
import { HiOutlineMail } from 'react-icons/hi';
import { RiLockPasswordLine } from 'react-icons/ri';
import Pill from '../../../../Buttons/Pill';
import { Input } from '../../../../Input/Input';
const AccountOpt = () => {
  const passwordRef = useRef();

  return (
    <ul className="p-3 w-full overflow-y-hidden flex flex-col items-center gap-5">
      <li className="flex flex-col w-full">
        <Input
          label="Email"
          value="vallen@gmail.com"
          disabled={true}
          icon={<HiOutlineMail className="text-lg" />}
        />
      </li>
      <li className="w-full">
        <form className="space-y-5">
          <Input
            icon={<RiLockPasswordLine className="text-lg" />}
            type="password"
            label="Password"
            innerRef={passwordRef}
          />

          <Pill className="text-base flex items-center gap-1 bg-gray-700 text-gray-100 hover:bg-blue-400 hover:text-white">
            <FiSave />
            <span className="font-semibold">Save</span>
          </Pill>
        </form>
      </li>
    </ul>
  );
};

export default AccountOpt;
