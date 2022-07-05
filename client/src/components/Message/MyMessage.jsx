export const MyMessage = ({ msg, time }) => {
  return (
    <div className="h-max w-full flex items-center justify-end">
      <div className="max-w-[75%] bg-white rounded-lg shadow p-3 flex flex-col gap-1">
        <span className="text-gray-600 leading-5 md:leading-6 text-xs">
          {msg}
        </span>
        <time className="text-xxs text-gray-400 font-light">{time}</time>
      </div>
    </div>
  );
};
