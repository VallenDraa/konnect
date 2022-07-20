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
          className="text-xxs rounded-full absolute -top-1 -right-1 bg-red-500 text-white grid place-content-center aspect-square"
        >
          <span className="text-xs">{children}</span>
        </div>
      )}
    </>
  );
}
