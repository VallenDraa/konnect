export const Menu = ({ menus, activeMenuState }) => {
  const { activeMenu, setActiveMenu } = activeMenuState;

  return (
    <ul className="flex justify-evenly divide-x-2">
      {menus.map((menu, i) =>
        activeMenu === menu.name ? (
          <li
            key={i}
            onClick={() => setActiveMenu(menu.name)}
            className="cursor-pointer flex flex-col items-center gap-1 text-xxs w-full text-blue-400 p-1 rounded-lg duration-200"
          >
            <menu.icon className="text-lg" />
            <span>{menu.name}</span>
          </li>
        ) : (
          <li
            key={i}
            onClick={() => setActiveMenu(menu.name)}
            className="cursor-pointer flex flex-col items-center gap-1 text-xxs w-full text-gray-500 hover:text-blue-400 p-1 rounded-lg duration-200"
          >
            <menu.icon className="text-lg" />
            <span>{menu.name}</span>
          </li>
        )
      )}
    </ul>
  );
};
