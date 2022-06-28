import { useState } from 'react';
import Dropdown from '../../../../../../../Dropdown/Dropdown';
import DropdownItem from '../../../../../../../Dropdown/DropdownItem/DropdownItem';

export default function Language() {
  const LANGUAGES = ['English', 'Indonesian'];
  const [activeLanguage, setActiveLanguage] = useState(LANGUAGES[0]);

  return (
    <>
      <Dropdown
        text={activeLanguage}
        fontSize={14}
        className="absolute right-7"
        position={'origin-top-right right-0'}
      >
        {LANGUAGES.map((l) => {
          return (
            <DropdownItem
              key={l}
              isActive={l === activeLanguage}
              onClick={() => setActiveLanguage(l)}
            >
              <span>{l}</span>
            </DropdownItem>
          );
        })}
      </Dropdown>
    </>
  );
}
