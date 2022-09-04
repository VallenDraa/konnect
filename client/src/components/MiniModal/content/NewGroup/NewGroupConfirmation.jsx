import { useContext, useState } from "react";
import MINI_MODAL_ACTIONS from "../../../../context/miniModal/miniModalActions";
import { MiniModalContext } from "../../../../context/miniModal/miniModalContext";
import Pill from "../../../Buttons/Pill";
import Input from "../../../Input/Input";

export default function NewGroupConfirmation({ cb, selected }) {
  const { miniModalDispatch } = useContext(MiniModalContext);
  const [name, setName] = useState("");

  const handleMakeNewGroup = (e) => {
    e.preventDefault();

    if (cb) cb(name);
    miniModalDispatch({ type: MINI_MODAL_ACTIONS.closing });
  };

  return (
    <form
      onSubmit={handleMakeNewGroup}
      className="flex flex-col grow text-center p-5"
    >
      <header className="flex flex-col w-full relative">
        <div className="space-y-1">
          <h3 className="font-bold text-base text-gray-800 pt-2">
            Make A New Group ?
          </h3>
          <p className="text-xs text-gray-400">
            Are you sure you want to make a new group
          </p>
        </div>
      </header>
      <main className="overflow-y-auto grow-[20] mt-3 w-full flex flex-col">
        {/* list the selected user */}
        <ul className="grow-[10] space-y-2">
          {selected.map(({ user }, i) => {
            return (
              <li
                key={i}
                className={`cursor-default bg-gray-100 rounded-lg shadow flex items-center gap-2 py-2 px-3 grow`}
              >
                <img
                  src="https://picsum.photos/200/200"
                  alt=""
                  className="rounded-full h-8 w-8"
                />

                <span className="font-semibold truncate">{user.username}</span>
              </li>
            );
          })}
        </ul>

        {/* input for group name */}
        <div className="grow-[1]">
          <Input
            customState={[name, setName]}
            required={true}
            label={"Group Name"}
            type={"text"}
          />
        </div>
      </main>
      <footer className="flex w-full gap-x-2 h-10 grow-[1] pt-3">
        <Pill
          className={`h-full text-xs bg-gray-300 text-gray-600 hover:bg-gray-400 hover:text-gray-100 font-bold border-0`}
          type="button"
          onClick={() =>
            miniModalDispatch({ type: MINI_MODAL_ACTIONS.closing })
          }
        >
          No
        </Pill>
        <Pill
          disabled={name === ""}
          type="submit"
          className="h-full text-xs disabled:cursor-not-allowed disabled:bg-blue-100 bg-blue-400 hover:bg-blue-300 text-gray-50 disabled:shadow-none hover:shadow-blue-100 font-bold border-0"
        >
          Yes
        </Pill>
      </footer>
    </form>
  );
}
