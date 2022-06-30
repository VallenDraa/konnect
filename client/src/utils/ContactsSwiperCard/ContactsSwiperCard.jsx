import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import PicturelessProfile from '../../components/PicturelessProfile/PicturelessProfile';
import charToRGB from '../charToRGB/charToRGB';
import welcome from '../../svg/othersProfile/welcome.svg';
import RenderIf from '../React/RenderIf';

export default function ContactsSwiperCard({ contacts }) {
  if (!contacts) return;

  // render the swiper slides if the user has contacts
  if (contacts.length !== 0) {
    return (
      <Swiper
        spaceBetween={8}
        slidesPerView="auto"
        navigation
        className="relative"
        style={{ cursor: contacts.length >= 4 ? 'grab' : 'default' }}
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
                <RenderIf conditionIs={!user.profilePicture}>
                  <PicturelessProfile
                    width={80}
                    initials={user.initials}
                    bgColor={`rgb(${result.r} ${result.g} ${result.b})`}
                  />
                </RenderIf>
                <span className="font-semibold text-sm max-w-full truncate">
                  {user.username}
                </span>
              </Link>
            </SwiperSlide>
          );
        })}
        <RenderIf conditionIs={contacts.length >= 4}>
          <div className="absolute right-0 inset-y-0 bg-gradient-to-r from-transparent to-gray-800/10 w-8 z-20"></div>
        </RenderIf>
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
}
