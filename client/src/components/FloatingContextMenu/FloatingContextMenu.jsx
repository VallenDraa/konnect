import { useEffect, useContext } from "react";
import { FCMContext } from "../../context/FCMContext/FCMContext";

export default function FloatingContextMenu({ children }) {
  const { isOpen, pos, FCMRef, closeContextMenu } = useContext(FCMContext);

  useEffect(() => {
    window.addEventListener("resize", closeContextMenu);

    return () => window.removeEventListener("resize", closeContextMenu);
  }, [isOpen]);

  return (
    <div
      aria-label="floating-context-menu"
      ref={FCMRef}
      className="min-h-[4rem] w-48 max-w-[12rem] fixed divide-y-2 bg-gray-50 border-2 border-gray-200 text-gray-800 rounded-md overflow-clip shadow-md origin-top"
      style={{
        top: pos?.y,
        left: pos?.x,
        zIndex: isOpen ? "50" : "-1",
        visibility: isOpen ? "" : "hidden",
      }}
    >
      {children}
    </div>
  );
}
