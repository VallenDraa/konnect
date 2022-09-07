import { FaUserAlt, FaUsers } from "react-icons/fa";

export default function GroupProfileModalContent() {
  return (
    <section
      aria-label="Group Profile"
      className="w-screen lg:w-[40rem] h-full"
    >
      <div className="w-32 h-32 bg-gray-200 flex justify-center items-center">
        <FaUsers className="text-gray-400 text-7xl" />
      </div>
    </section>
  );
}
