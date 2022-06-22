import { useContext, useEffect, useReducer } from 'react';
import { useState } from 'react';
import { BiHappyHeartEyes } from 'react-icons/bi';
import { FaPaperPlane } from 'react-icons/fa';
import { IoPersonAdd } from 'react-icons/io5';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import welcome from '../../../../svg/othersProfile/welcome.svg';
import api from '../../../../utils/apiAxios/apiAxios';
import charToRGB from '../../../../utils/charToRGB/charToRGB';
import RenderIf from '../../../../utils/React/RenderIf';
import Input from '../../../Input/Input';
import PicturelessProfile from '../../../PicturelessProfile/PicturelessProfile';
import Pill from '../../../Buttons/Pill';
import addRequestSentReducer, {
  ADD_REQUEST_SENT_DEFAULT,
} from '../../../../reducer/contactRequestSent/contactRequestSentReducer';
import socket from '../../../../utils/socketClient/socketClient';
import { UserContext } from '../../../../context/user/userContext';
import generateRgb from '../../../../utils/generateRgb/generateRgb';

export const OthersProfileModalContent = ({ username }) => {
  const [otherUserData, setOtherUserData] = useState({});
  const { userState } = useContext(UserContext);
  const [addRequestSent, dispatch] = useReducer(
    addRequestSentReducer,
    ADD_REQUEST_SENT_DEFAULT
  );
  const [rgb, setRgb] = useState('');

  // fetch user detail from the server
  useEffect(() => {
    const getUserDetail = async () => {
      try {
        const { data } = await api.get(
          `/query/user/get_user_detail?username=${username}`
        );

        setOtherUserData(data);
      } catch (error) {
        console.log(error);
      }
    };

    getUserDetail();
  }, []);

  // turn initials to rgb
  useEffect(() => {
    if (!otherUserData.initials) return;
    const newRgb = generateRgb(otherUserData.initials);

    setRgb(newRgb);
  }, [otherUserData]);

  const FriendsSwiperCard = ({ contacts }) => {
    // render the swiper slides if the user has contacts
    if (contacts.length !== 0) {
      return (
        <Swiper
          spaceBetween={8}
          slidesPerView="auto"
          navigation
          className="relative cursor-grab"
        >
          {x.map((xa, i) =>
            contacts.map(({ user }, i) => {
              const rgb = charToRGB(user.initials.split(''));

              const result = {
                r: rgb[0],
                g: rgb[1] || rgb[0] + rgb[0] <= 200 ? rgb[0] + rgb[0] : 200,
                b: rgb[2] || rgb[0] + rgb[1] <= 200 ? rgb[0] + rgb[1] : 200,
              };

              return (
                <SwiperSlide
                  key={i}
                  className="flex flex-col items-center gap-y-1.5 max-w-[125px] hover:bg-gray-100 duration-200 cursor-pointer p-3 mx-5"
                >
                  <PicturelessProfile
                    width={100}
                    initials={user.initials}
                    bgColor={`rgb(${result.r} ${result.g} ${result.b})`}
                  />
                  <span className="font-semibold">{user.username}</span>
                </SwiperSlide>
              );
            })
          )}
          <div className="absolute right-0 inset-y-0 bg-gradient-to-r from-transparent to-gray-800/10 w-8 z-20"></div>
        </Swiper>
      );

      // render an svg otherwise
    } else {
      return (
        <div className="text-center space-y-3">
          <img src={welcome} alt="" className="w-1/5 max-w-[160px] mx-auto" />
          <div className="flex flex-col gap-y-1">
            <span className="font-semibold text-gray-500">
              Oops No One Here....
            </span>
            <span className="font-light text-gray-400 text-xs">
              Be the first one here by adding this person to your contact !
            </span>
          </div>
        </div>
      );
    }
  };

  const handleAddContact = () => {
    const senderToken = sessionStorage.getItem('token');
    socket.emit(
      'send-add-contact',
      userState.user._id,
      otherUserData._id,
      senderToken
    );
  };

  return (
    <section
      aria-label="Profile"
      className="w-screen md:w-[40rem] flex flex-col h-full"
    >
      <header className="text-center">
        <h1 className="font-semibold pb-3">
          {username.replace('%20', ' ')}'s Profile
        </h1>
      </header>
      <main className="grow shadow-inner">
        <div className="w-full max-h-[90vh] min-h-full sm:h-[66vh] bg-white overflow-y-auto flex flex-col">
          {/* profile pic */}
          <header>
            <RenderIf conditionIs={!otherUserData.profilePic}>
              <div className="bg-gradient-to-br from-blue-200 via-blue-400 to-pink-400 h-[210px] w-full flex items-center justify-center">
                <PicturelessProfile
                  initials={otherUserData.initials}
                  bgColor={rgb}
                  width={140}
                />
              </div>
            </RenderIf>
          </header>
          {/* user data */}
          <footer className="py-3 space-y-8">
            <header className="flex justify-between items-center gap-y-1 px-5">
              {/* username */}
              <div className="flex gap-x-2 items-center">
                <span className="text-3xl font-semibold mt-2">
                  {otherUserData.username}
                </span>
                {/* date joined */}
                <span className="text-xxs text-gray-400 font-medium">
                  EST. {new Date(otherUserData.createdAt).toLocaleDateString()}
                </span>
              </div>
              {/* buttons */}
              <div className="flex h-full gap-x-2 items-center">
                <Pill
                  onClick={handleAddContact}
                  className="text-base px-4 py-1 font-bold hover:bg-pink-400 active:bg-pink-500 hover:text-white flex items-center gap-x-2"
                >
                  <IoPersonAdd /> Add
                </Pill>
                <Pill className="text-base px-4 py-1 font-bold hover:bg-blue-400 active:bg-blue-500 hover:text-white flex items-center gap-x-2">
                  <FaPaperPlane />
                  Message
                </Pill>
              </div>
            </header>
            <main className="space-y-5">
              {/* user status */}
              <div className="px-5">
                <Input
                  label="Status"
                  type="text"
                  disabled={true}
                  icon={<BiHappyHeartEyes className="text-lg" />}
                  value={otherUserData.status || 'Unset'}
                />
              </div>

              {/* friends with */}
              <div className="space-y-3">
                <span className="text-lg font-medium text-gray-400 px-5">
                  Related To:
                </span>
                {/* swiper */}

                <RenderIf conditionIs={otherUserData.contacts}>
                  <FriendsSwiperCard contacts={otherUserData.contacts} />
                </RenderIf>
              </div>
            </main>
          </footer>
        </div>
      </main>
    </section>
  );
};
