import { FaCheck, FaTimes } from "react-icons/fa";
import { ImBlocked } from "react-icons/im";
import { Link } from "react-router-dom";
import { UserContext } from "../../../../../../context/user/userContext";
import { useContext, useState } from "react";
import socket from "../../../../../../utils/socketClient/socketClient";
import RenderIf from "../../../../../../utils/React/RenderIf";
import { SettingsContext } from "../../../../../../context/settingsContext/SettingsContext";
import { useCallback } from "react";
import Pill from "../../../../../Buttons/Pill";
import PP from "../../../../../PP/PP";

export default function ContactNotif({ info, type }) {
  const { userState } = useContext(UserContext);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const [hasBeenPressed, setHasBeenPressed] = useState(false);

  const handleResponse = useCallback(
    (answer, type) => {
      if (type === "inbox") {
        const payload = {
          answer,
          token: sessionStorage.getItem("token"),
          senderId: info.by?._id,
          recipientId: userState.user._id,
        };
        setHasBeenPressed(true);
        socket.emit("contact-requests-response", payload);
      }
    },
    [userState]
  );

  const cancelRequest = useCallback(() => {
    const payload = {
      token: sessionStorage.getItem("token"),
      senderId: userState.user._id,
      recipientId: info.by?._id,
    };
    setHasBeenPressed(true);

    socket.emit("cancel-add-contact", payload);
  }, [userState]);

  return (
    <div
      className={`"block w-full hover:bg-gray-100 p-3 space-y-3 ${
        general?.animation ? "duration-200" : ""
      }`}
    >
      <header className="flex justify-between mb-5">
        <span className="text-xxs text-gray-400 font-bold self-end">
          CONTACT REQUEST
        </span>
        <span className="text-xxs text-gray-400 self-end">
          {new Date(info.iat).toLocaleDateString()}
        </span>
      </header>
      {/* notif info*/}
      <main className={`flex items-center gap-3`}>
        <aside>
          <Link
            title={`Go to ${info.by?.username}'s profile`}
            to={`/user/${info.by?.username}`}
          >
            <PP
              alt={info.by?.username}
              src={info.by?.profilePicture || null}
              className="w-12 h-12 rounded-full"
              type="private"
            />
          </Link>
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
            <Pill
              disabled={hasBeenPressed}
              className={`h-full text-xs bg-gray-300 text-gray-500 hover:bg-gray-400 hover:text-gray-100 font-bold border-0`}
              type="button"
              onClick={() => handleResponse(false, type)}
            >
              <FaTimes />
              Reject
            </Pill>
            <Pill
              disabled={hasBeenPressed}
              className="h-full text-xs bg-blue-400 hover:bg-blue-300 text-gray-50 hover:text-white hover:shadow-blue-100 active:shadow-blue-100 font-bold border-0"
              type="button"
              onClick={() => handleResponse(true, type)}
            >
              <FaCheck />
              Accept
            </Pill>
          </footer>
        </RenderIf>

        <RenderIf conditionIs={type === "outbox"}>
          <footer className="flex items-center gap-2 self-end">
            <Pill
              onClick={cancelRequest}
              className="bg-gray-300 text-gray-600 hover:bg-gray-400 hover:text-gray-200 max-w-[150px] lg:max-w-full ml-auto"
            >
              <ImBlocked />
              Cancel
            </Pill>
          </footer>
        </RenderIf>
      </RenderIf>
    </div>
  );
}
