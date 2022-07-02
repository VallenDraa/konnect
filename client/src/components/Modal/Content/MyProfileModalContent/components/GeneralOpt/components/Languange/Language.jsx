import Dropdown from "../../../../../../../Dropdown/Dropdown";
import DropdownItem from "../../../../../../../Dropdown/DropdownItem/DropdownItem";

export const LANGUAGES = ["English", "Indonesian"];
export default function Language({ handleOptChange, language }) {
  return (
    <>
      <Dropdown
        text={language}
        fontSize={14}
        className="absolute right-6"
        position={"origin-top-right right-0"}
      >
        {LANGUAGES.map((l) => {
          return (
            <DropdownItem
              key={l}
              isActive={l === language}
              onClick={() => handleOptChange("language", l)}
            >
              <span>{l}</span>
            </DropdownItem>
          );
        })}
      </Dropdown>
    </>
  );
}
