import { useContext } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import PP from "../../components/PP/PP";
import { SettingsContext } from "../../context/settingsContext/SettingsContext";
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
        spaceBetween={10}
        slidesPerView="auto"
        navigation
        className="relative"
        style={{ cursor: contacts.length >= 4 ? "grab" : "default" }}
      >
        {contacts.map(({ user }, i) => {
          return (
            <SwiperSlide
              key={i}
              className={`relative w-[125px] overflow-hidden hover:bg-gray-100 cursor-pointer p-3 flex justify-center ${
                general?.animation ? "duration-200" : ""
              }`}
            >
              {/* this makes it easier for dealing with onlicks as we only need to deal with one element for  */}
              <RenderIf conditionIs={!linkable}>
                <div
                  data-user-card={i}
                  className="absolute inset-0"
                  onClick={(e) => onItemClicked && onItemClicked(user, e)}
                />
              </RenderIf>
              <RenderIf conditionIs={linkable}>
                <Link
                  to={`/user/${user.username}`}
                  className={`flex flex-col items-center gap-y-1.5 ${
                    general?.animation ? "animate-fade-in" : ""
                  }`}
                >
                  <PP
                    src={user.profilePicture || null}
                    alt={user.username}
                    type="private"
                    className="rounded-full h-20 mx-auto"
                  />

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
                  className={`flex flex-col items-center gap-y-1.5 ${
                    general?.animation ? "animate-fade-in" : ""
                  }`}
                >
                  <PP
                    src={user.profilePicture || null}
                    alt={user.username}
                    type="private"
                    className="rounded-full h-20 mx-auto"
                  />
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
            <span className="font-semibold text-gray-500">No users</span>
          </div>
        </div>
      </RenderIf>
    );
  }
}
