export const OtherMessage = ({ msg, time }) => {
  return (
    <div className="h-max w-full flex items-center">
      <div className="max-w-[75%] bg-gray-300 rounded-lg shadow-sm p-3 text-sm flex flex-col gap-1">
        <span className="leading-5 md:leading-6 text-xs">{msg}</span>
        <time className="text-xxs text-gray-600 font-light self-end">
          {time}
        </time>
      </div>
    </div>
  );
};
