import Input from '../../../Input/Input';
import { useContext } from 'react';
import { MiniModalContext } from '../../../../context/miniModal/miniModalContext';
import MINI_MODAL_ACTIONS from '../../../../context/miniModal/miniModalActions';
import { useState } from 'react';
import Pill from '../../../Buttons/Pill';

/**
 *
 * @param {Object} param0 Pass in a callback that'll execute
 * @returns
 */
export default function PasswordConfirmation({ cb, title, caption, payload }) {
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
      className="flex flex-col grow text-center p-5"
    >
      <header className="flex flex-col w-full grow-[20]">
        <header className="space-y-1">
          <h3 className="font-bold text-base text-gray-800 pt-2">{title}</h3>
          <p className="text-xs text-gray-400">{caption}</p>
        </header>
        <footer className="mt-[20%]">
          <Input type="password" customState={[password, setPassword]} />
        </footer>
      </header>
      <footer className="flex w-full gap-x-2 h-10 grow-[1] pt-3">
        <Pill
          className="h-full text-xs bg-gray-300 text-gray-600 hover:bg-gray-400 hover:text-gray-100 font-bold duration-200 border-0"
          type="button"
          onClick={() =>
            miniModalDispatch({ type: MINI_MODAL_ACTIONS.closing })
          }
        >
          Cancel
        </Pill>
        <Pill
          className="h-full text-xs bg-blue-400 hover:bg-blue-300 text-gray-50 hover:text-white hover:shadow-blue-100 active:shadow-blue-100 font-bold duration-200 border-0"
          type="submit"
        >
          Change
        </Pill>
      </footer>
    </form>
  );
}
