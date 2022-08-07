export default function Notice({ children }) {
  return (
    <li className="justify-center mx-5 my-2 rounded-full flex text-xxs text-gray-800 py-1 px-4 relative">
      <div className="bg-gray-100 relative z-20 px-3 text-gray-500 max-w-screen-md break-all">
        {children}
      </div>
      <hr className="absolute top-1/2 inset-x-0 border-gray-300" />
    </li>
  );
}
