import { useContext, useEffect, useReducer } from "react";
import { useState } from "react";
import { BiHappyHeartEyes } from "react-icons/bi";
import "swiper/css";
import api from "../../../../utils/apiAxios/apiAxios";
import RenderIf from "../../../../utils/React/RenderIf";
import PicturelessProfile from "../../../PicturelessProfile/PicturelessProfile";
import Pill from "../../../Buttons/Pill";
import socket from "../../../../utils/socketClient/socketClient";
import generateRgb from "../../../../utils/generateRgb/generateRgb";
import USER_ACTIONS from "../../../../context/user/userAction";
import SendRequestBtn from "./SendRequestBtn/SendRequestBtn";
import NOTIF_CONTEXT_ACTIONS from "../../../../context/notifContext/notifContextActions";
import ContactsSwiperCard from "../../../../utils/ContactsSwiperCard/ContactsSwiperCard";
import addRequestSentReducer, {
  ADD_REQUEST_SENT_DEFAULT,
  ADD_REQUEST_SENT_ACTIONS,
} from "../../../../reducer/contactRequestSent/contactRequestSentReducer";
import { FaPaperPlane } from "react-icons/fa";
import { UserContext } from "../../../../context/user/userContext";
import { ImProfile } from "react-icons/im";
import {
  ContactsContext,
  receiveRemoveContact,
} from "../../../../context/contactContext/ContactContext";
import {
  NotifContext,
  receiveCancelAddContact,
  receiveContactRequestResponse,
  receiveSendAddContact,
} from "../../../../context/notifContext/NotifContext";
import { useNavigate } from "react-router-dom";
import PP from "../../../PP/PP";
import { CachedUserContext } from "../../../../context/cachedUser/CachedUserContext";

export const OthersProfileModalContent = ({ username, userId }) => {
  const [otherUserData, setOtherUserData] = useState({});
  const { userState, userDispatch } = useContext(UserContext);
  const [addRequestSent, requestDispatch] = useReducer(
    addRequestSentReducer,
    ADD_REQUEST_SENT_DEFAULT
  );
  const { fetchCachedUsers } = useContext(CachedUserContext);
  const { Start, Loading, Error, Sent } = ADD_REQUEST_SENT_ACTIONS;
  const [rgb, setRgb] = useState("");
  const { contacts, setContacts } = useContext(ContactsContext);
  const { notifs, notifsDispatch, notifUnseen, setNotifUnseen } =
    useContext(NotifContext);
  const [isAFriend, setIsAFriend] = useState(false); //check if the other user is already friends with me
  const [isRequesting, setIsRequesting] = useState(false); //check if i've already sent a contact request
  const [isRequested, setIsRequested] = useState(false); //check if a request has already been sent to me by the other user
  const navigate = useNavigate();

  //for both sending and cancelling a contact request
  const handleSendContactRequest = () => {
    requestDispatch({ type: Start });
    requestDispatch({ type: Loading });
    const payload = {
      recipientId: otherUserData._id,
      senderId: userState.user._id,
      token: sessionStorage.getItem("token"),
    };

    socket.emit("send-add-contact", payload);
  };

  const handleCancelContactRequest = () => {
    requestDispatch({ type: Start });
    requestDispatch({ type: Loading });
    const payload = {
      recipientId: otherUserData._id,
      senderId: userState.user._id,
      token: sessionStorage.getItem("token"),
    };

    socket.emit("cancel-add-contact", payload);
  };

  // for removing a contact from the user data
  const handleRemoveContact = () => {
    requestDispatch({ type: Start });
    const senderToken = sessionStorage.getItem("token");
    requestDispatch({ type: Loading });

    socket.emit(
      "remove-contact",
      userState.user._id,
      otherUserData?._id,
      senderToken
    );
  };

  // for handling incoming contact request
  const handleIncomingContactRequest = () => {
    navigate("/notifications?box=inbox");
  };

  // to determine which contact function to be executed
  const handleAction = () => {
    if (isAFriend) return handleRemoveContact();
    if (isRequested) return handleIncomingContactRequest();
    if (isRequesting) return handleCancelContactRequest();
    handleSendContactRequest();
  };

  //update the notifs context when receiving a contact request
  useEffect(() => {
    receiveSendAddContact({
      cb: ({ type }) => {
        type === "inbox" ? setIsRequested(true) : setIsRequesting(true);
        requestDispatch({ type: Sent });
      },
      notifs,
      notifsDispatch,
      notifUnseen,
      setNotifUnseen,
      notifActions: NOTIF_CONTEXT_ACTIONS,
    });

    return () => socket.off("receive-send-add-contact");
  }, [notifs, notifUnseen]);

  // when a contact request is cancelled
  useEffect(() => {
    receiveCancelAddContact({
      cb: ({ type }) => {
        type === "inbox" ? setIsRequested(false) : setIsRequesting(false);
        requestDispatch({ type: Sent });
      },
      notifs,
      notifsDispatch,
      notifUnseen,
      setNotifUnseen,
      notifActions: NOTIF_CONTEXT_ACTIONS,
      userState,
    });

    return () => socket.off("receive-cancel-add-contact");
  }, [userState, notifs, notifUnseen]);

  // update sender data when the recipient accepts or rejects a contact request
  useEffect(() => {
    receiveContactRequestResponse({
      cb: (answer, type) => {
        type === "inbox" ? setIsRequested(false) : setIsRequesting(false);
        setIsAFriend(answer);
      },
      contacts,
      setContacts,
      notifs,
      notifsDispatch,
      notifActions: NOTIF_CONTEXT_ACTIONS,
      token: sessionStorage.getItem("token"),
      userState,
    });

    return () => socket.off("receive-contact-request-response");
  }, [userState, contacts, notifs]);

  //handle removing other contact
  useEffect(() => {
    receiveRemoveContact({
      setContacts,
      cb: () => {
        setIsAFriend(false);
        requestDispatch({ type: Sent });
      },
    });

    return () => socket.off("receive-remove-contact");
  }, []);

  // fetch other user detail from the server
  useEffect(() => {
    setOtherUserData({});

    const getOtherUserDetail = async () => {
      try {
        const { data } = await api.get(
          `/query/user/get_user_detail?username=${username}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );

        return data === null ? navigate("/chats") : setOtherUserData(data);
      } catch (error) {
        console.log(error);
      }
    };

    setTimeout(getOtherUserDetail, 300);
  }, [username]);

  // turn initials to rgb
  useEffect(() => {
    if (!otherUserData?.initials) return;
    const newRgb = generateRgb(otherUserData?.initials);

    setRgb(newRgb);
  }, [otherUserData]);

  // gets the other user data and determine the state of the action button next to the msg button
  useEffect(() => {
    const otherUserId = otherUserData?._id;
    const { outbox, inbox } = notifs.content;

    // check if the other user target is already a friend of mine
    if (contacts.length > 0) {
      for (const { user } of contacts) {
        if (otherUserId === user._id) {
          setIsAFriend(true);
          break;
        }
      }
    } else {
      setIsAFriend(false);
    }

    // check if the other user target sent a contact request to me
    if (outbox.length > 0) {
      for (const { by, answer } of outbox) {
        if (by._id === otherUserId && answer === null) {
          setIsRequesting(true);
          break;
        }
      }
    } else {
      // console.log('is not requesting');
      setIsRequesting(false);
    }

    // check if i've sent the other user a contact request
    if (inbox.length > 0) {
      for (const { by, answer } of inbox) {
        if (by._id === otherUserId && answer === null) {
          setIsRequested(true);
          break;
        }
      }
    } else {
      // console.log('is not requested');
      setIsRequested(false);
    }
  }, [contacts, notifs, otherUserData]);

  // useEffect(() => console.log(otherUserData), [otherUserData]);

  return (
    <section
      aria-label="Profile"
      className="w-screen lg:w-[40rem] flex flex-col h-full"
    >
      <div className="grow shadow-md lg:shadow-inner">
        <div className="w-full min-h-full h-0 bg-white overflow-y-auto flex flex-col container max-w-screen-sm mx-auto">
          {/* profile pic */}
          <header className="bg-gradient-to-br from-blue-200 via-blue-400 to-pink-400 py-4">
            <PP
              src={otherUserData.profilePic || null}
              alt={otherUserData.username}
              type="private"
              className="rounded-full h-44 mx-auto"
            />
          </header>
          {/* user data */}
          <footer className="py-3 space-y-8">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 px-5">
              {/* username */}
              <div className="flex gap-x-2 items-center self-center">
                <span className="text-3xl font-semibold mt-2">
                  {otherUserData?.username}
                </span>
                {/* date joined */}
                <span className="text-xxs text-gray-400 font-medium">
                  EST. {new Date(otherUserData?.createdAt).toLocaleDateString()}
                </span>
              </div>
              {/* buttons */}
              <RenderIf conditionIs={Object.keys(otherUserData).length > 0}>
                <div className="flex h-full grow sm:flex-grow-0 gap-x-2 items-center">
                  <Pill
                    disabled={addRequestSent.Loading}
                    onClick={handleAction}
                    className="text-base px-4 py-1 font-bold bg-pink-400 hover:shadow-pink-100 hover:bg-pink-300 active:bg-pink-500 text-white flex items-center gap-x-2 disabled:cursor-not-allowed disabled:hover:bg-gray-100  disabled:hover:text-gray-700 disabled:shadow disabled:bg-gray-100"
                  >
                    <SendRequestBtn
                      Loading={addRequestSent.Loading}
                      Sent={addRequestSent.Sent}
                      error={addRequestSent.error}
                      isAFriend={isAFriend}
                      isRequested={isRequested}
                      isRequesting={isRequesting}
                    />
                  </Pill>

                  <Pill
                    link={`/chats?id=${otherUserData._id}&type=private`}
                    className="text-base px-4 py-1 font-bold bg-blue-400 hover:bg-blue-300 hover:shadow-blue-100 text-gray-50 hover:text-white flex items-center gap-x-2"
                  >
                    <FaPaperPlane />
                    Message
                  </Pill>
                </div>
              </RenderIf>
            </header>
            <main className="space-y-5">
              {/* fullname */}
              <RenderIf
                conditionIs={
                  otherUserData?.firstName !== "" ||
                  otherUserData?.lastName !== ""
                }
              >
                <div className="px-5">
                  <h3 className="flex items-center gap-x-1 mb-2 text-xs font-semibold text-gray-400">
                    <ImProfile className="text-xxs" />
                    Full Name :
                  </h3>
                  <span className="text-base text-gray-600 font-semibold px-2">
                    {otherUserData?.firstName} {otherUserData?.lastName}
                  </span>
                </div>
              </RenderIf>

              {/* user status */}
              <div className="px-5">
                <h3 className="flex items-center gap-x-1 mb-2 text-xs font-semibold text-gray-400 relative -left-[2px]">
                  <BiHappyHeartEyes className="text-sm" />
                  Status :
                </h3>
                <span className="text-base text-gray-600 font-semibold px-2">
                  {otherUserData?.status || "unset"}
                </span>
              </div>

              {/* friends with */}
              <div className="space-y-3 border-t-2 pt-3">
                <span className="text-lg font-medium text-gray-400 px-5">
                  Related To:
                </span>
                {/* swiper */}

                <ContactsSwiperCard contacts={otherUserData?.contacts} />
              </div>
            </main>
          </footer>
        </div>
      </div>
    </section>
  );
};
