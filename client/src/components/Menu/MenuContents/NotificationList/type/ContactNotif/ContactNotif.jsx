import { FaCheck, FaTimes } from "react-icons/fa";
import { ImBlocked } from "react-icons/im";
import { Link } from "react-router-dom";
import { UserContext } from "../../../../../../context/user/userContext";
import { useContext } from "react";
import generateRgb from "../../../../../../utils/generateRgb/generateRgb";

import PicturelessProfile from "../../../../../PicturelessProfile/PicturelessProfile";
import socket from "../../../../../../utils/socketClient/socketClient";
import RenderIf from "../../../../../../utils/React/RenderIf";
import { SettingsContext } from "../../../../../../context/settingsContext/SettingsContext";

export default function ContactNotif({ info, type }) {
  const { userState } = useContext(UserContext);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  const handleResponse = (answer, type) => {
    if (type === "inbox") {
      const payload = {
        answer,
        token: sessionStorage.getItem("token"),
        senderId: info.by?._id,
        recipientId: userState.user._id,
      };
      socket.emit("contact-requests-response", payload);
    }
  };

  const cancelRequest = () => {
    const payload = {
      token: sessionStorage.getItem("token"),
      senderId: userState.user._id,
      recipientId: info.by?._id,
    };

    socket.emit("cancel-add-contact", payload);
  };

  return (
    <Link
      title={`Go to ${info.by?.username}'s profile`}
      to={`/user/${info.by?.username}`}
      className={`"block w-full hover:bg-gray-100  p-3 
                ${general?.animation ? "duration-200" : ""}`}
    >
      <header className="flex justify-between mb-5">
        <span className="text-xxs text-gray-400 font-extrabold self-end">
          CONTACT REQUEST
        </span>
        <span className="text-xxs text-gray-400 self-end">
          {new Date(info.iat).toLocaleDateString()}
        </span>
      </header>
      {/* notif info*/}
      <main className={`flex items-center gap-3`}>
        <aside>
          <RenderIf conditionIs={!info.by?.profilePicture}>
            <PicturelessProfile
              width={info.answer !== null ? 40 : 50}
              initials={info.by?.initials}
              bgColor={() => generateRgb(info.by?.initials)}
            />
          </RenderIf>
        </aside>

        <main className="flex flex-col items-center gap-y-1">
          <span className="text-slate-500 text-sm">
            <RenderIf conditionIs={info.answer === null}>
              <RenderIf conditionIs={type === "inbox"}>
                <span className="font-bold text-slate-800">
                  {info.by?.username}
                </span>{" "}
                has sent you a contact request !
              </RenderIf>
              <RenderIf conditionIs={type === "outbox"}>
                A contact request has been sent to{" "}
                <span className="font-bold text-slate-800">
                  {info.by?.username}
                </span>
              </RenderIf>
            </RenderIf>

            <RenderIf conditionIs={info.answer !== null}>
              <RenderIf conditionIs={info.answer === true}>
                <span className="font-bold text-slate-800">
                  {info.by?.username}
                </span>{" "}
                has been added to your contacts list.
              </RenderIf>
              <RenderIf conditionIs={info.answer === false}>
                <RenderIf conditionIs={type === "outbox"}>
                  <span className="font-bold text-slate-800">
                    {info.by?.username}
                  </span>{" "}
                  rejected your contact request.
                </RenderIf>
                <RenderIf conditionIs={type === "inbox"}>
                  You rejected a contact request by{" "}
                  <span className="font-bold text-slate-800">
                    {info.by?.username}
                  </span>
                </RenderIf>
              </RenderIf>
            </RenderIf>
          </span>
        </main>
      </main>
      {/* response options will only render if request hasn't been answered yet */}
      <RenderIf conditionIs={info.answer === null}>
        <RenderIf conditionIs={type === "inbox"}>
          <footer className="flex items-center gap-2 mt-2 self-end">
            <button
              onClick={() => handleResponse(false, type)}
              className={`"font-semibold text-xs flex items-center gap-x-1 py-2 px-4 shadow-md hover:shadow-sm active:shadow-inner active:shadow-pink-600 bg-gray-200 rounded-md hover:bg-pink-400 active:bg-pink-500 hover:text-white 
                        ${general?.animation ? "duration-200" : ""}`}
            >
              <FaTimes />
              Reject
            </button>
            <button
              onClick={() => handleResponse(true, type)}
              className={`"font-semibold text-xs flex items-center gap-x-1 py-2 px-4 shadow-md hover:shadow-sm active:shadow-inner active:shadow-blue-600 bg-gray-200 rounded-md hover:bg-blue-400 active:bg-blue-500 hover:text-white 
                        ${general?.animation ? "duration-200" : ""}`}
            >
              <FaCheck />
              Accept
            </button>
          </footer>
        </RenderIf>
        <RenderIf conditionIs={type === "outbox"}>
          <div className="flex items-center gap-2 self-end">
            <button
              onClick={cancelRequest}
              className={`"font-semibold text-xs flex items-center gap-x-1  py-2 px-4 shadow-md hover:shadow-sm active:shadow-inner bg-gray-200 rounded-md hover:bg-pink-400 active:bg-pink-500 hover:text-white 
                        ${general?.animation ? "duration-200" : ""}`}
            >
              <ImBlocked />
              Cancel
            </button>
          </div>
        </RenderIf>
      </RenderIf>
    </Link>
  );
}
