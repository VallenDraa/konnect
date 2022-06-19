export default function NotifBadge({ children, isActive, size = 20 }) {
  return (
    <>
      {isActive && (
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            fontSize: `${(parseInt(size) * 65) / 100}px`,
          }}
          className="w-4 h-4 text-xxs rounded-full absolute -top-1 -right-1 bg-red-500 text-white flex items-center justify-center"
        >
          <span className="">{children}</span>
        </div>
      )}
    </>
  );
}
