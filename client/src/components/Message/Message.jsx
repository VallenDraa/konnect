import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { BiCheck, BiCheckDouble } from 'react-icons/bi';
import RenderIf from '../../utils/React/RenderIf';

export const Message = ({
  state,
  msg,
  time,
  isSentByMe,
  // ,state
}) => {
  const formattedTime = time
    .toTimeString()
    .slice(0, time.toTimeString().lastIndexOf(':'));

  return (
    <div
      className={`h-max flex items-center mt-5 animate-pop-in
                     ${isSentByMe ? 'justify-end' : ''}`}
    >
      <div
        className={`max-w-[75%] rounded-lg shadow p-3 space-y-2 min-w-[100px]
                      ${isSentByMe ? 'bg-white' : ' bg-gray-300'}`}
      >
        <span
          className={`text-gray-800 leading-5 md:leading-6 text-sm self-start`}
        >
          {msg}
        </span>

        <div
          className={`text-xxs flex items-center gap-2 self-end
                    ${isSentByMe ? 'justify-between' : 'justify-start'}
        `}
        >
          <time
            className={`font-light
                       ${isSentByMe ? 'text-gray-400' : 'text-gray-600'}`}
          >
            {formattedTime}
          </time>

          <RenderIf conditionIs={isSentByMe}>
            <RenderIf conditionIs={!state.isSent}>
              <AiOutlineLoading3Quarters className="animate-spin" />
            </RenderIf>
          </RenderIf>

          {/* check if message hasn't been sent or read yet */}
          {/* <RenderIf conditionIs={!state.isSent && !state.isRead}>
              <BiCheck className="text-lg self-start animate-fade-in text-gray-400" />
            </RenderIf> */}

          {/* check if message has been sent but not read yet */}
          {/* <RenderIf conditionIs={state.isSent && !state.isRead}>
              <BiCheckDouble className="text-lg self-start animate-fade-in text-gray-400" />
            </RenderIf> */}

          {/* check if message has been sent and read */}
          {/* <RenderIf conditionIs={state.isSent && state.isRead}>
              <BiCheckDouble className="text-lg self-start animate-fade-in text-blue-400" />
            </RenderIf> */}
        </div>
      </div>
    </div>
  );
};
