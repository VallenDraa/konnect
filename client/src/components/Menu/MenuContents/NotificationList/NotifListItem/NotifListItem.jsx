export default function NotifListItem({ children }) {
  return (
    <li className="rounded-lg text-slate-500 min-h-[80px] flex items-center animate-d-down-open border-b-2">
      {children}
    </li>
  );
}
