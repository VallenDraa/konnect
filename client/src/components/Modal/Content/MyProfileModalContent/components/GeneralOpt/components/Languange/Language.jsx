import Dropdown from '../../../../../../../Dropdown/Dropdown';
import DropdownItem from '../../../../../../../Dropdown/DropdownItem/DropdownItem';

export default function Language() {
  return (
    <>
      <Dropdown
        text="English"
        fontSize={14}
        position={'origin-top-right right-0'}
      >
        <DropdownItem>English</DropdownItem>
        <DropdownItem>Indonesian</DropdownItem>
      </Dropdown>
    </>
  );
}
