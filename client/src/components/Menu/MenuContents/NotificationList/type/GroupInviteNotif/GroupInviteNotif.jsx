import { FaCheck, FaTimes } from "react-icons/fa";
import { UserContext } from "../../../../../../context/user/userContext";
import { useContext } from "react";
import socket from "../../../../../../utils/socketClient/socketClient";
import RenderIf from "../../../../../../utils/React/RenderIf";
import { SettingsContext } from "../../../../../../context/settingsContext/SettingsContext";
import Pill from "../../../../../Buttons/Pill";
import PP from "../../../../../PP/PP";

export default function GroupInviteNotif({ info }) {
  const { userState } = useContext(UserContext);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  const handleResponse = (answer) => {
    const payload = {
      groupId: info.group._id,
      userId: userState.user._id,
      token: sessionStorage.getItem("token"),
    };

    answer
      ? socket.emit("accept-group-invite", payload)
      : socket.emit("reject-group-invite", payload);
  };

  return (
    <div
      className={`"block w-full hover:bg-gray-100 p-3 space-y-3 ${
        general?.animation ? "duration-200" : ""
      }`}
    >
      <header className="flex justify-between mb-5">
        <span className="text-xxs text-gray-400 font-bold self-end">
          GROUP INVITE
        </span>
        <span className="text-xxs text-gray-400 self-end">
          {new Date(info.iat).toLocaleDateString()}
        </span>
      </header>
      {/* notif info*/}
      <main className={`flex items-center gap-3`}>
        <aside>
          <PP
            alt={info.group?.name}
            src={info.group?.profilePicture || null}
            className="w-12 h-12 rounded-full"
            type="group"
          />
        </aside>

        <main className="flex flex-col items-center gap-y-1">
          <span className="text-slate-500 text-sm">
            <RenderIf conditionIs={info.answer === null}>
              <span className="font-bold text-slate-800">
                {info.by?.username}
              </span>{" "}
              has invited you to join {info.group?.name} !
            </RenderIf>

            <RenderIf conditionIs={info.answer !== null}>
              <RenderIf conditionIs={info.answer === true}>
                You have joined {info.group?.name}
              </RenderIf>
              <RenderIf conditionIs={info.answer === false}>
                You rejected an invitation to join {info.group?.name}
              </RenderIf>
            </RenderIf>
          </span>
        </main>
      </main>
      {/* response options will only render if request hasn't been answered yet */}
      <RenderIf conditionIs={info.answer === null}>
        <footer className="flex items-center gap-2 mt-6 self-end">
          <Pill
            className={`h-full text-xs bg-gray-300 text-gray-500 hover:bg-gray-400 hover:text-gray-100 font-bold border-0`}
            type="button"
            onClick={() => handleResponse(false)}
          >
            <FaTimes />
            Reject
          </Pill>
          <Pill
            className="h-full text-xs bg-blue-400 hover:bg-blue-300 text-gray-50 hover:text-white hover:shadow-blue-100 active:shadow-blue-100 font-bold border-0"
            type="button"
            onClick={() => handleResponse(true)}
          >
            <FaCheck />
            Accept
          </Pill>
        </footer>
      </RenderIf>
    </div>
  );
}
