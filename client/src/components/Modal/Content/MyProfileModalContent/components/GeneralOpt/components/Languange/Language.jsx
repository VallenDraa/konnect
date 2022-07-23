import Dropdown from '../../../../../../../Dropdown/Dropdown';
import DropdownItem from '../../../../../../../Dropdown/DropdownItem/DropdownItem';

export const LANGUAGES = ['English', 'Indonesian'];
export default function Language({ languageState }) {
  const { language, setLanguage } = languageState;

  return (
    <>
      <Dropdown
        text={language}
        fontSize={14}
        offset={8}
        btnClassName="hover:shadow-sm hover:text-gray-800 hover:bg-gray-300"
        position={'origin-top-right right-0'}
      >
        {LANGUAGES.map((l) => {
          return (
            <DropdownItem
              key={l}
              isActive={l === language}
              onClick={() => setLanguage(l)}
            >
              <span>{l}</span>
            </DropdownItem>
          );
        })}
      </Dropdown>
    </>
  );
}
