import { useId, useRef } from 'react';
import { Input } from '../../../../Input/Input';
import { FaCamera } from 'react-icons/fa';
import { FiSave } from 'react-icons/fi';
import { BiRename, BiHappyHeartEyes } from 'react-icons/bi';

import Pill from '../../../../Buttons/Pill';

const ProfileOpt = () => {
  const imageId = useId();
  const usernameRef = useRef();
  const statusRef = useRef();

  return (
    <form className="p-3 w-full overflow-y-hidden flex flex-col items-center gap-10">
      {/* image */}
      <div className="flex flex-col relative w-1/2 group">
        <label
          htmlFor={imageId}
          className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-gray-100 tracking-wide gap-1 duration-200 cursor-pointer"
        >
          <FaCamera className="text-3xl" />
          <span className="text-xs font-semibold">Change Picture</span>
        </label>
        <input type="file" id={imageId} className="hidden" />
        {/* image preview */}
        <img
          src="https://picsum.photos/200/200"
          alt=""
          className="w-full aspect-square rounded-full"
        />
      </div>
      <div className="w-full space-y-5">
        <div className="flex flex-col w-full">
          <Input
            label="Username"
            icon={<BiRename className="text-lg" />}
            innerRef={usernameRef}
          />
        </div>
        <div className="flex flex-col w-full">
          <Input
            icon={<BiHappyHeartEyes className="text-lg" />}
            label="Status"
            innerRef={statusRef}
          />
        </div>
      </div>
      <Pill className="text-base flex items-center gap-1 bg-gray-700 text-gray-100 hover:bg-blue-400 hover:text-white">
        <FiSave />
        <span className="font-semibold">Save</span>
      </Pill>
    </form>
  );
};

export default ProfileOpt;
