export default function NotifListItem({ children }) {
  return (
    <li className="p-3 rounded-lg my-3 text-slate-500 min-h-[80px] flex items-center">
      {children}
    </li>
  );
}
