import { IoClose } from 'react-icons/io5';

export default function MiniModal({ children }) {
  return (
    <div className="fixed bg-black/30 inset-0 flex items-center justify-center z-30">
      <div className="min-h-[200px] w-screen sm:w-[600px] bg-white shadow-xl rounded-xl flex flex-col mx-5">
        {children}
      </div>
    </div>
  );
}
