export const Message = ({ msg, time, isSentByMe }) => {
  const formattedTime = time
    .toTimeString()
    .slice(0, time.toTimeString().lastIndexOf(':'));

  return (
    <div
      className={`h-max flex items-center 
                     ${isSentByMe ? 'justify-end' : ''}`}
    >
      <div
        className={`max-w-[75%] rounded-lg shadow p-3 flex flex-col gap-1
                      ${isSentByMe ? 'bg-white' : ' bg-gray-300'}`}
      >
        <span className={`text-gray-600 leading-5 md:leading-6 text-xs`}>
          {msg}
        </span>
        <time
          className={`text-xxs font-light
                        ${isSentByMe ? 'text-gray-400' : 'text-gray-600'}`}
        >
          {formattedTime}
        </time>
      </div>
    </div>
  );
};
