export default function Pill({ className, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`py-1 w-full text-xxs border-2 shadow-sm rounded-full flex items-center gap-1 justify-center duration-200 ${className}`}
    >
      {children}
    </button>
  );
}
