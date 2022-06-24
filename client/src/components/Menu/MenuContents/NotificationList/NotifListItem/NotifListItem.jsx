export default function NotifListItem({ children }) {
  return (
    <li className="p-3 rounded-lg mb-2 text-slate-500 min-h-[80px] flex items-center">
      {children}
    </li>
  );
}
