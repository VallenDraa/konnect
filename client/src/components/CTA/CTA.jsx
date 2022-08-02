import { useCallback, useContext, useEffect, useRef } from "react";
import { IoPeopleSharp, IoCall, IoChatbubbles } from "react-icons/io5";
import MODAL_ACTIONS from "../../context/modal/modalActions";
import { ModalContext } from "../../context/modal/modalContext";
import Pill from "../Buttons/Pill";
import NewChat from "./contents/NewChat/NewChat";
import NewGroup from "./contents/NewGroup/NewGroup";
import StartCall from "./contents/StartCall/StartCall";
import { useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import _ from "lodash";
import RenderIf from "../../utils/React/RenderIf";
import { Logo } from "../Logo/Logo";
import { FaLongArrowAltLeft } from "react-icons/fa";
import { SettingsContext } from "../../context/settingsContext/SettingsContext";
import { SidebarContext } from "../../pages/Home/Home";

export default function CTA({
  className = "flex justify-evenly gap-2",
  urlHistory,
  enableSlide,
}) {
  const { isSidebarOn } = useContext(SidebarContext);
  const { modalState, modalDispatch } = useContext(ModalContext);
  const location = useLocation();
  const swipeBall = useRef();
  const swiper = useRef();
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  // to determine which action modal to open
  useEffect(() => {
    const [route, subroute] = location.pathname.split("/").slice(1, 3);
    if (route !== "new") return;

    const switchContent = (subroute) => {
      switch (subroute) {
        case "chat":
          return <NewChat />;

        case "call":
          return <StartCall />;

        case "group":
          return <NewGroup />;

        default:
          break;
      }
    };

    // check if the useEffect is trying to render the same content twice
    if (
      JSON.stringify(modalState.content) ===
      JSON.stringify(switchContent(subroute))
    )
      return;

    modalDispatch({
      type: MODAL_ACTIONS.show,
      prevUrl: urlHistory?.current,
      onExitReturnToHome: false,
      content: switchContent(subroute),
    });
  }, [location]);

  // auto close the CTA buttons for smaller screen when sidebar is not open
  useEffect(() => {
    if (!isSidebarOn) {
      if (swiper.current?.activeIndex) swiper.current.slideTo(0);
    }
  }, [isSidebarOn]);

  const CtaButtons = () => {
    return (
      <>
        {/* call */}
        <Pill
          link="/new/call"
          className="bg-gray-200 text-gray-500 hover:bg-slate-100 tracking-normal lg:max-w-[130px]"
          onClick={() => {
            modalDispatch({
              type: MODAL_ACTIONS.show,
              prevUrl: urlHistory?.current,
              onExitReturnToHome: false,
              content: <StartCall />,
            });
            swiper?.current?.slideTo(0);
          }}
        >
          <span className="flex items-center gap-1">
            <IoCall />
            Start Call
          </span>
        </Pill>

        {/* message */}
        <Pill
          link="/new/chat"
          className="bg-gray-200 text-gray-500 hover:bg-slate-100 tracking-normal lg:max-w-[130px]"
          onClick={() => {
            modalDispatch({
              type: MODAL_ACTIONS.show,
              prevUrl: urlHistory?.current,
              onExitReturnToHome: false,
              content: <NewChat />,
            });
            swiper?.current?.slideTo(0);
          }}
        >
          <span className="flex items-center gap-1">
            <IoChatbubbles />
            New Chat
          </span>
        </Pill>

        {/* group */}
        <Pill
          link="/new/group"
          className="bg-gray-200 text-gray-500 hover:bg-slate-100 tracking-normal lg:max-w-[130px]"
          onClick={() => {
            modalDispatch({
              type: MODAL_ACTIONS.show,
              prevUrl: urlHistory?.current,
              onExitReturnToHome: false,
              content: <NewGroup />,
            });
            swiper?.current?.slideTo(0);
          }}
        >
          <span className="flex items-center gap-1">
            <IoPeopleSharp />
            New Group
          </span>
        </Pill>
      </>
    );
  };

  // function for when the user is moving the CTA button swiper
  const handleSwiping = useCallback(
    _.throttle(
      () => {
        if (swipeBall.current.style.width !== "36px") return;
        swipeBall.current.style.width = "100px";
        swipeBall.current.classList.add("mr-5");
      },
      1000,
      { trailing: false }
    ),
    [swipeBall]
  );

  // function for when the user stop moving the CTA button swiper
  const handleSwipingStop = () => {
    swipeBall.current.style.width = "36px";
    swipeBall.current.classList.remove("mr-5");
  };

  return (
    <>
      <RenderIf conditionIs={enableSlide}>
        <Swiper
          onSwiper={(instance) => (swiper.current = instance)}
          spaceBetween={15}
          onSliderMove={handleSwiping}
          onTouchEnd={handleSwipingStop}
          className="lg:hidden"
          slidesPerView={"auto"}
        >
          <SwiperSlide className="text-sm flex justify-end rounded-full relative group cursor-grab">
            <div
              ref={swipeBall}
              style={{ height: "36px", width: "36px" }}
              className={`rounded-full bg-gradient-to-br from-pink-300 via-blue-200 to-blue-100 flex items-center
                        ${general?.animation ? "duration-200" : ""}`}
            >
              {/* floating text */}
              <span
                className={`inset-y-0 absolute flex items-center gap-x-2 right-3 transition group-hover:-translate-x-1
                        ${general?.animation ? "duration-200" : ""}`}
              >
                <FaLongArrowAltLeft
                  className={`group-hover:translate-x-0 translate-x-1 transition text-lg text-blue-400 h-[28px]
                        ${general?.animation ? "duration-200" : ""}`}
                />
                <Logo />
              </span>
            </div>
          </SwiperSlide>
          <SwiperSlide className={className}>
            <CtaButtons />
          </SwiperSlide>
        </Swiper>
      </RenderIf>
      <div
        className={`${className}
                  ${enableSlide ? "hidden lg:flex" : ""}`}
      >
        <CtaButtons />
      </div>
    </>
  );
}
