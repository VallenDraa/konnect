import { useContext, useEffect, useId, useState } from 'react';
import { UserContext } from '../../../../../context/user/userContext';
import { BiRename, BiHappyHeartEyes } from 'react-icons/bi';
import { FaCamera, FaPaperPlane } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Link } from 'react-router-dom';
import { FiSave } from 'react-icons/fi';
import generateRgb from '../../../../../utils/generateRgb/generateRgb';
import welcome from '../../../../../svg/othersProfile/welcome.svg';
import Pill from '../../../../Buttons/Pill';
import Input from '../../../../Input/Input';
import PicturelessProfile from '../../../../PicturelessProfile/PicturelessProfile';
import RenderIf from '../../../../../utils/React/RenderIf';
import SendRequestBtn from '../../OthersProfileModalContent/SendRequestBtn/SendRequestBtn';
import charToRGB from '../../../../../utils/charToRGB/charToRGB';

const ProfileOpt = () => {
  const imageId = useId();
  const { userState } = useContext(UserContext);
  const [status, setStatus] = useState(userState.user.status || '');
  const [username, setUsername] = useState(userState.user.username);
  const [rgb, setRgb] = useState('');

  // turn initials to rgb
  useEffect(() => {
    if (!userState.user.initials) return;
    const newRgb = generateRgb(userState.user.initials);

    setRgb(newRgb);
  }, [userState]);

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
          {contacts.map(({ user }, i) => {
            const rgb = charToRGB(user.initials.split(''));

            const result = {
              r: rgb[0],
              g: rgb[1] || rgb[0] + rgb[0] <= 200 ? rgb[0] + rgb[0] : 200,
              b: rgb[2] || rgb[0] + rgb[1] <= 200 ? rgb[0] + rgb[1] : 200,
            };

            return (
              <SwiperSlide
                key={i}
                className="max-w-[125px] hover:bg-gray-100 duration-200 cursor-pointer p-3 mx-5"
              >
                <Link
                  to={`/user/${user.username}`}
                  className="flex flex-col items-center gap-y-1.5"
                >
                  <PicturelessProfile
                    width={80}
                    initials={user.initials}
                    bgColor={`rgb(${result.r} ${result.g} ${result.b})`}
                  />
                  <span className="font-semibold text-sm max-w-full truncate">
                    {user.username}
                  </span>
                </Link>
              </SwiperSlide>
            );
          })}
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

  // return (
  //   <form className="p-3 w-full overflow-y-hidden flex flex-col items-center gap-10">
  //     {/* image */}
  //     <div className="flex flex-col relative w-1/2 group">
  //       <label
  //         htmlFor={imageId}
  //         className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-gray-100 tracking-wide gap-1 duration-200 cursor-pointer"
  //       >
  //         <FaCamera className="text-3xl" />
  //         <span className="text-xs font-semibold">Change Picture</span>
  //       </label>
  //       <input type="file" id={imageId} className="hidden" />
  //       {/* image preview */}
  //       <img
  //         src="https://picsum.photos/200/200"
  //         alt=""
  //         className="w-full aspect-square rounded-full"
  //       />
  //     </div>
  //     <div className="w-full space-y-5">
  //       <div className="flex flex-col w-full">
  //         <Input
  //           label="Status"
  //           type="text"
  //           customState={[status, setStatus]}
  //           icon={<BiHappyHeartEyes className="text-lg" />}
  //         />
  //       </div>
  //       <div className="flex flex-col w-full">
  //         <Input
  //           label="Username"
  //           type="text"
  //           customState={[username, setUsername]}
  //           icon={<BiRename className="text-lg" />}
  //         />
  //       </div>
  //     </div>
  //     <Pill className="text-base flex items-center gap-1 bg-gray-700 text-gray-100 hover:bg-blue-400 hover:text-white">
  //       <FiSave />
  //       <span className="font-semibold">Save</span>
  //     </Pill>
  //   </form>
  // );
  return (
    <section className="w-full overflow-y-hidden space-y-10">
      <main className="shadow-inner">
        <div className="w-full bg-white overflow-y-auto flex flex-col">
          {/* profile pic */}
          <header>
            <RenderIf conditionIs={!userState.user.profilePic}>
              <div className="bg-gradient-to-br from-blue-200 via-blue-400 to-pink-400 h-[210px] w-full flex items-center justify-center">
                <PicturelessProfile
                  initials={userState.user.initials}
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
                  {userState.user.username}
                </span>
                {/* date joined */}
                <span className="text-xxs text-gray-400 font-medium">
                  EST. {new Date(userState.user.createdAt).toLocaleDateString()}
                </span>
              </div>
              {/* buttons */}
              <div className="flex h-full gap-x-2 items-center">
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
                  value={userState.user.status || 'Unset'}
                />
              </div>

              {/* friends with */}
              <div className="space-y-3">
                <span className="text-lg font-medium text-gray-400 px-5">
                  Contacts:
                </span>
                {/* swiper */}

                <RenderIf conditionIs={userState.user.contacts}>
                  <FriendsSwiperCard contacts={userState.user.contacts} />
                </RenderIf>
              </div>
            </main>
          </footer>
        </div>
      </main>
    </section>
  );
};

export default ProfileOpt;
