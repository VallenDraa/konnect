import { useContext, useEffect, useRef } from 'react';
import { IoPeopleSharp, IoCall, IoChatbubbles } from 'react-icons/io5';
import MODAL_ACTIONS from '../../context/modal/modalActions';
import { ModalContext } from '../../context/modal/modalContext';
import Pill from '../Buttons/Pill';
import NewChat from './contents/NewChat/NewChat';
import NewGroup from './contents/NewGroup/NewGroup';
import StartCall from './contents/StartCall/StartCall';
import { useLocation } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { BsArrowLeft } from 'react-icons/bs';
import throttle from '../../utils/performance/throttle';
import RenderIf from '../../utils/React/RenderIf';

export default function CTA({
  className = 'flex justify-evenly gap-2',
  urlHistory,
  enableSlide,
}) {
  const { modalState, modalDispatch } = useContext(ModalContext);
  const location = useLocation();
  const swipeBall = useRef();

  useEffect(() => {
    const [route, subroute] = location.pathname.split('/').slice(1, 3);
    if (route !== 'new') return;

    const switchContent = (subroute) => {
      switch (subroute) {
        case 'chat':
          return <NewChat />;

        case 'call':
          return <StartCall />;

        case 'group':
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

  const CtaButtons = () => {
    return (
      <>
        {/* call */}
        <Pill
          link="/new/call"
          className="bg-gray-200 hover:bg-slate-100 lg:max-w-[130px]"
          onClick={() =>
            modalDispatch({
              type: MODAL_ACTIONS.show,
              prevUrl: urlHistory?.current,
              onExitReturnToHome: false,
              content: <StartCall />,
            })
          }
        >
          <span className="flex items-center gap-1">
            <IoCall />
            Start Call
          </span>
        </Pill>

        {/* message */}
        <Pill
          link="/new/chat"
          className="bg-gray-200 hover:bg-slate-100 lg:max-w-[130px]"
          onClick={() =>
            modalDispatch({
              type: MODAL_ACTIONS.show,
              prevUrl: urlHistory?.current,
              onExitReturnToHome: false,
              content: <NewChat />,
            })
          }
        >
          <span className="flex items-center gap-1">
            <IoChatbubbles />
            New Chat
          </span>
        </Pill>

        {/* group */}
        <Pill
          link="/new/group"
          className="bg-gray-200 hover:bg-slate-100 lg:max-w-[130px]"
          onClick={() =>
            modalDispatch({
              type: MODAL_ACTIONS.show,
              prevUrl: urlHistory?.current,
              onExitReturnToHome: false,
              content: <NewGroup />,
            })
          }
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
  const handleSwiping = throttle(() => {
    if (swipeBall.current.style.width !== '36px') return;
    swipeBall.current.style.width = '100px';
    swipeBall.current.classList.add('mr-3');
  }, 1000);

  // function for when the user stop moving the CTA button swiper
  const handleSwipingStop = () => {
    swipeBall.current.style.width = '36px';
    swipeBall.current.classList.remove('mr-3');
  };

  return (
    <>
      <RenderIf conditionIs={enableSlide}>
        <Swiper
          spaceBetween={15}
          onSliderMove={handleSwiping}
          onTouchEnd={handleSwipingStop}
          className="lg:hidden"
          slidesPerView={'auto'}
        >
          <SwiperSlide className="text-sm flex justify-end rounded-full relative group cursor-grab">
            <div
              ref={swipeBall}
              style={{ height: '36px', width: '36px' }}
              className="rounded-full bg-gradient-to-br from-blue-200 via-blue-400 to-pink-400 duration-200"
            >
              {/* floating text */}
              <div className="absolute flex items-center gap-x-2 inset-y-0 right-3 transition duration-200 group-hover:-translate-x-1">
                <BsArrowLeft className="group-hover:translate-x-0 translate-x-1 transition duration-200" />
                <span>Swipe For More</span>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide className={className}>
            <CtaButtons />
          </SwiperSlide>
        </Swiper>
      </RenderIf>
      <div
        className={`${className}
                  ${enableSlide ? 'hidden lg:flex' : ''}`}
      >
        <CtaButtons />
      </div>
    </>
  );
}
