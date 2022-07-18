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
        className="absolute right-[40px] lg:right-[30px]"
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
