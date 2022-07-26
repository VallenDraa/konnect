import { useContext } from "react";
import { AiOutlineLoading3Quarters, AiFillHourglass } from "react-icons/ai";
import { BiBlock } from "react-icons/bi";
import { IoPersonAdd, IoPersonRemove } from "react-icons/io5";
import { SettingsContext } from "../../../../../context/settingsContext/SettingsContext";

export default function SendRequestBtn({
  Loading,
  Sent,
  error,
  isAFriend,
  isRequesting,
  isRequested,
}) {
  const { settings } = useContext(SettingsContext);

  // the button initial state
  if ((!Loading && !error) || Sent) {
    if (isAFriend) {
      return (
        <>
          <IoPersonRemove />
          <span>Remove</span>
        </>
      );
    } else if (isRequesting) {
      return (
        <>
          <AiFillHourglass />
          <span>Requesting</span>
        </>
      );
    } else if (isRequested) {
      return (
        <>
          <IoPersonAdd />
          <span>Incoming</span>
        </>
      );
    } else {
      return (
        <>
          <IoPersonAdd />
          <span>Add</span>
        </>
      );
    }
  } else if (error) {
    return (
      <>
        <BiBlock />
        <span>Failed</span>
      </>
    );
  } else if (Loading) {
    return (
      <span
        className={`flex items-center gap-x-1
                  ${settings.general?.animation ? "animate-pulse" : ""}`}
      >
        <AiOutlineLoading3Quarters className="animate-spin" />
        <span>Loading</span>
      </span>
    );
  }
}
