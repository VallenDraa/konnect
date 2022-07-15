import { useContext, useEffect, useReducer } from "react";
import { useState } from "react";
import { BiHappyHeartEyes } from "react-icons/bi";
import { FaPaperPlane } from "react-icons/fa";
import "swiper/css";
import api from "../../../../utils/apiAxios/apiAxios";
import RenderIf from "../../../../utils/React/RenderIf";
import PicturelessProfile from "../../../PicturelessProfile/PicturelessProfile";
import Pill from "../../../Buttons/Pill";
import addRequestSentReducer, {
  ADD_REQUEST_SENT_DEFAULT,
  ADD_REQUEST_SENT_ACTIONS,
} from "../../../../reducer/contactRequestSent/contactRequestSentReducer";
import socket from "../../../../utils/socketClient/socketClient";
import { UserContext } from "../../../../context/user/userContext";
import generateRgb from "../../../../utils/generateRgb/generateRgb";
import USER_ACTIONS from "../../../../context/user/userAction";
import SendRequestBtn from "./SendRequestBtn/SendRequestBtn";
import ContactsSwiperCard from "../../../../utils/ContactsSwiperCard/ContactsSwiperCard";
import { useNavigate } from "react-router-dom";
import { ImProfile } from "react-icons/im";

export const OthersProfileModalContent = ({ username }) => {
  const [otherUserData, setOtherUserData] = useState({});
  const { userState, userDispatch } = useContext(UserContext);
  const [addRequestSent, requestDispatch] = useReducer(
    addRequestSentReducer,
    ADD_REQUEST_SENT_DEFAULT
  );
  const { Start, Loading, Error, Sent } = ADD_REQUEST_SENT_ACTIONS;
  const [rgb, setRgb] = useState("");
  const [isAFriend, setIsAFriend] = useState(false); //check if the other user is already friends with me
  const [isRequesting, setIsRequesting] = useState(false); //check if i've already sent a contact request
  const [isRequested, setIsRequested] = useState(false); //check if a request has already been sent to me by the other user
  const navigate = useNavigate();

  //for both sending and cancelling a contact request
  const handleContactRequest = () => {
    requestDispatch({ type: Start });
    const senderToken = sessionStorage.getItem("token");
    requestDispatch({ type: Loading });

    const cancel = isRequesting ? true : false;

    socket.emit(
      "send-add-contact",
      userState.user._id,
      otherUserData?._id,
      senderToken,
      cancel
    );
  };

  // for removing a contact from the user data
  const handleRemoveContact = () => {
    // console.log('remove');
    requestDispatch({ type: Start });
    const senderToken = sessionStorage.getItem("token");
    requestDispatch({ type: Loading });
    socket.emit(
      "remove-contact",
      userState.user._id,
      otherUserData?._id,
      senderToken
    );

    requestDispatch({ type: Sent });
  };

  // for handling incoming contact request
  const handleIncomingContactRequest = () => {
    navigate("/notifications?box=inbox");
  };

  // to determine which contact function to be executed
  const handleAction = () => {
    if (isAFriend) return handleRemoveContact();
    if (isRequested) return handleIncomingContactRequest();

    return handleContactRequest();
  };

  // useEffect(() => {
  //   console.log(isAFriend, isRequesting, isRequested);
  // }, [isAFriend, isRequesting, isRequested]);

  // fetch other user detail from the server
  useEffect(() => {
    const getOtherUserDetail = async () => {
      try {
        const { data } = await api.get(
          `/query/user/get_user_detail?username=${username}`
        );

        data === null && navigate("/chats");

        setOtherUserData(data);
      } catch (error) {
        console.log(error);
      }
    };

    setTimeout(getOtherUserDetail, 500);
    // console.log('fetching other user detail from the server');
  }, [userState]);

  // turn initials to rgb
  useEffect(() => {
    if (!otherUserData?.initials) return;
    const newRgb = generateRgb(otherUserData?.initials);

    setRgb(newRgb);
  }, [otherUserData]);

  // refresh userState after sending an add contact request
  useEffect(() => {
    socket.off("update-client-data");

    socket.on("update-client-data", (response, ...args) => {
      // console.log(args, response);
      if (response.success) {
        const { user, token } = response;

        userDispatch({ type: USER_ACTIONS.updateSuccess, payload: user });
        sessionStorage.setItem("token", token);
        requestDispatch({ type: Sent });
        setIsRequesting(false);
        setIsRequested(false);

        for (const arg of args) {
          // console.log(arg);
          arg.unfriend && setIsAFriend(false);
        }
      } else {
        requestDispatch({ type: Error, payload: response.message });
        console.log(response.message);
      }
    });

    return () => socket.off("update-client-data");
  }, []);

  // gets the other user data and determine the state of the action button next to the msg button
  useEffect(() => {
    const otherUserId = otherUserData?._id;
    const { contacts, requests } = userState.user;
    const { outbox, inbox } = requests.contacts;

    // check if the other user target is already a friend of mine
    if (contacts.length > 0) {
      for (const { user } of contacts) {
        if (otherUserId === user) {
          // console.log(otherUserId === user, otherUserId, user, 'friend');
          setIsAFriend(true);
        }
      }
    } else {
      setIsAFriend(false);
    }

    // check if the other user target sent a contact request to me
    if (outbox.length > 0) {
      for (const { by, answer } of outbox) {
        if (by === otherUserId && answer === null) {
          // console.log(
          //   by === otherUserId && answer === null,
          //   by,
          //   otherUserId,
          //   answer,
          //   'requesting'
          // );
          setIsRequesting(true);
        }
      }
    } else {
      // console.log('is not requesting');
      setIsRequesting(false);
    }

    // check if i've sent the other user a contact request
    if (inbox.length > 0) {
      for (const { by, answer } of inbox) {
        if (by === otherUserId && answer === null) {
          // console.log(
          //   by === otherUserId && answer === null,
          //   by,
          //   otherUserId,
          //   answer,
          //   'requested'
          // );
          setIsRequested(true);
        }
      }
    } else {
      // console.log('is not requested');
      setIsRequested(false);
    }
  }, [userState, otherUserData]);

  return (
    <section
      aria-label="Profile"
      className="w-screen md:w-[40rem] flex flex-col h-full"
    >
      <header className="text-center">
        <h1 className="font-semibold pb-3">
          {username.replace("%20", " ")}'s Profile
        </h1>
      </header>
      <main className="grow shadow-inner">
        <div className="w-full min-h-full h-0 bg-white overflow-y-auto flex flex-col">
          {/* profile pic */}
          <header>
            <RenderIf conditionIs={!otherUserData?.profilePic}>
              <div className="bg-gradient-to-br from-blue-200 via-blue-400 to-pink-400 h-[210px] w-full flex items-center justify-center">
                <PicturelessProfile
                  initials={otherUserData?.initials}
                  bgColor={rgb}
                  width={160}
                />
              </div>
            </RenderIf>
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
              <div className="flex h-full grow sm:flex-grow-0 gap-x-2 items-center">
                <Pill
                  onClick={handleAction}
                  className="text-base px-4 py-1 font-bold hover:bg-pink-400 active:bg-pink-500 hover:text-white flex items-center gap-x-2"
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
                <RenderIf conditionIs={isAFriend}>
                  <Pill className="text-base px-4 py-1 font-bold hover:bg-blue-400 active:bg-blue-500 hover:text-white flex items-center gap-x-2">
                    <FaPaperPlane />
                    Message
                  </Pill>
                </RenderIf>
              </div>
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
      </main>
    </section>
  );
};
