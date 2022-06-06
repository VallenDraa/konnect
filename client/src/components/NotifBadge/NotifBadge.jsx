export default function NotifBadge({ children }) {
  return (
    <div className="w-4 h-4 rounded-full absolute -top-1 -right-1 text-xxs bg-red-500 text-white flex items-center justify-center">
      <span className="">{children}</span>
    </div>
  );
}
