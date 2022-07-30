import { chatPreviewTimeStatus } from "../../../../../utils/dates/dates";

export default function TimeSeparator({ now, then }) {
  return (
    <li className="justify-center mx-5 my-2 rounded-full flex text-xxs text-gray-800 py-1 px-4 relative">
      <span className="bg-gray-100 relative z-20 px-3 text-gray-600">
        {chatPreviewTimeStatus(now, then, false)}
      </span>
      <hr className="absolute top-1/2 inset-x-0 border-gray-400" />
    </li>
  );
}
