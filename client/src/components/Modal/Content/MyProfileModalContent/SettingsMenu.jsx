import { useState } from 'react';
import { useEffect } from 'react';
import throttle from '../../../../utils/performance/throttle';
import RenderIf from '../../../../utils/React/RenderIf';
import Dropdown from '../../../Dropdown/Dropdown';
import DropdownItem from '../../../Dropdown/DropdownItem/DropdownItem';

export default function SettingsMenu({ options, activeOptState }) {
  const { activeOpt, setActiveOpt } = activeOptState;
  const [Icon, setIcon] = useState(null);
  const [isOnTop, setIsOnTop] = useState(false);

  //   check if the settings menu would be on top of the screen or the side
  useEffect(() => {
    setIsOnTop(window.innerWidth <= 1024);
    const moveMenuToTop = throttle(() => {
      setIsOnTop(window.innerWidth <= 1024);
    }, 60);

    window.addEventListener('resize', moveMenuToTop);

    return () => window.removeEventListener('resize', moveMenuToTop);
  }, []);

  useEffect(() => {
    const { icon } = options.find(({ name }) => name === activeOpt);
    setIcon(icon);
  }, [activeOpt]);

  return (
    <aside className="bg-gray-100 basis-auto lg:basis-1/3">
      <ul>
        <RenderIf conditionIs={!isOnTop}>
          {options.map((opt, i) => {
            return (
              <li
                key={i}
                onClick={() => setActiveOpt(opt.name)}
                className={`${
                  opt.name === activeOpt
                    ? 'bg-white text-gray-800 font-semibold'
                    : 'hover:bg-gray-200 text-gray-500 hover:text-gray-600 font-medium'
                } cursor-pointer p-2 capitalize duration-200 text-sm lg:text-base flex items-center gap-2 h-9`}
              >
                <span className="text-base lg:text-lg">{opt.icon}</span>
                <span>{opt.name}</span>
              </li>
            );
          })}
        </RenderIf>
        <RenderIf conditionIs={isOnTop}>
          <Dropdown
            // fontSize={14}
            icon={Icon}
            text={activeOpt}
            position={'origin-top'}
            className="border-y-2 bg-gray-200 hover:bg-gray-100 duration-200 text-black"
            btnClassName="border-0 shadow-none w-full flex justify-center py-1 text-lg"
            listStyle={{ width: '100%', borderRadius: '0px' }}
            listClassName="shadow-xl"
          >
            {options.map((opt) => (
              <DropdownItem
                key={opt.name}
                onClick={() => setActiveOpt(opt.name)}
                isActive={opt.name === activeOpt}
                className="flex justify-center items-center"
              >
                <span className="capitalize flex items-center gap-x-2 text-base">
                  {opt.icon}
                  {opt.name}
                </span>
              </DropdownItem>
            ))}
          </Dropdown>
        </RenderIf>
      </ul>
    </aside>
  );
}
