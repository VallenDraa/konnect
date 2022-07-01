import Input from '../../../Input/Input';
import { useContext } from 'react';
import { MiniModalContext } from '../../../../context/miniModal/miniModalContext';
import MINI_MODAL_ACTIONS from '../../../../context/miniModal/miniModalActions';
import { useState } from 'react';

/**
 *
 * @param {Object} param0 Pass in a callback that'll execute
 * @returns
 */
export default function PasswordConfirmation({ cb, title, payload }) {
  const { miniModalDispatch } = useContext(MiniModalContext);
  const [password, setPassword] = useState('');

  const handleAccountEdits = (e) => {
    e.preventDefault();
    cb(password, payload);
  };

  return (
    <form
      onSubmit={(e) => handleAccountEdits(e)}
      autoComplete="new-password"
      className="flex flex-col justify-between grow text-center"
    >
      <h3 className="font-semibold pt-3 text-sm sm:text-base">{title}</h3>
      <div className="w-full px-5">
        <Input type="password" customState={[password, setPassword]} />
      </div>
      <div className="border-t-4 flex w-full divide-x-2 h-10">
        <button
          className="basis-1/2 h-full hover:bg-pink-400 hover:text-white text-pink-400 font-light duration-200 rounded-bl-xl"
          type="button"
          onClick={() =>
            miniModalDispatch({ type: MINI_MODAL_ACTIONS.closing })
          }
        >
          Cancel
        </button>
        <button
          className="basis-1/2 h-full hover:bg-blue-400 hover:text-white text-blue-400 font-light duration-200 rounded-br-xl"
          type="submit"
        >
          Change
        </button>
      </div>
    </form>
  );
}
