import { useContext } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import PicturelessProfile from "../../components/PicturelessProfile/PicturelessProfile";
import { SettingsContext } from "../../context/settingsContext/SettingsContext";
import charToRGB from "../charToRGB/charToRGB";
import RenderIf from "../React/RenderIf";

export default function ContactsSwiperCard({
  onItemClicked = null,
  itemWidth = 80,
  contacts,
  linkable = true,
  mini = false,
}) {
  if (!contacts) return;
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  // render the swiper slides if the user has contacts
  if (contacts.length !== 0) {
    return (
      <Swiper
        slidesPerView="auto"
        navigation
        className="relative"
        style={{ cursor: contacts.length >= 4 ? "grab" : "default" }}
      >
        {contacts.map(({ user }, i) => {
          const rgb = charToRGB(user.initials.split(""));

          const result = {
            r: rgb[0],
            g: rgb[1] || rgb[0] + rgb[0] <= 200 ? rgb[0] + rgb[0] : 200,
            b: rgb[2] || rgb[0] + rgb[1] <= 200 ? rgb[0] + rgb[1] : 200,
          };

          return (
            <SwiperSlide
              key={i}
              className={`w-[125px] overflow-hidden hover:bg-gray-100 cursor-pointer p-3 flex justify-center ${
                general?.animation ? "duration-200" : ""
              }`}
            >
              <RenderIf conditionIs={linkable}>
                <Link
                  to={`/user/${user.username}`}
                  className={`flex flex-col items-center gap-y-1.5
                            ${general?.animation ? "animate-fade-in" : ""}   
                  `}
                >
                  <RenderIf conditionIs={!user.profilePicture}>
                    <PicturelessProfile
                      width={itemWidth}
                      initials={user.initials}
                      bgColor={`rgb(${result.r} ${result.g} ${result.b})`}
                    />
                  </RenderIf>
                  <span
                    style={{ fontSize: `${itemWidth / 4.5}px` }}
                    className="font-semibold text-sm truncate max-w-[125px]"
                  >
                    {user.username}
                  </span>
                </Link>
              </RenderIf>
              <RenderIf conditionIs={!linkable}>
                <button
                  onClick={() => onItemClicked && onItemClicked(user)}
                  className={`flex flex-col items-center gap-y-1.5 ${
                    general?.animation ? "animate-fade-in" : ""
                  }          
                  `}
                >
                  <RenderIf conditionIs={!user.profilePicture}>
                    <PicturelessProfile
                      width={itemWidth}
                      initials={user.initials}
                      bgColor={`rgb(${result.r} ${result.g} ${result.b})`}
                    />
                  </RenderIf>
                  <span
                    style={{ fontSize: `${itemWidth / 4.5}px` }}
                    className="font-semibold text-sm max-w-full truncate"
                  >
                    {user.username}
                  </span>
                </button>
              </RenderIf>
            </SwiperSlide>
          );
        })}
        <RenderIf conditionIs={contacts.length >= 4}>
          <div className="absolute right-0 inset-y-0 bg-gradient-to-r from-transparent to-gray-800/10 w-8 z-20" />
        </RenderIf>
      </Swiper>
    );

    // render an svg otherwise
  } else {
    return (
      <RenderIf conditionIs={!mini}>
        <div className="text-center space-y-3">
          <div className="flex flex-col gap-y-1 mt-5">
            <span className="font-semibold text-gray-500">
              Contact is empty
            </span>
          </div>
        </div>
      </RenderIf>
    );
  }
}
