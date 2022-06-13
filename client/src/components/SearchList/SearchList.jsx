import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { IoSearch } from 'react-icons/io5';
import Input from '../Input/Input';

export default function SearchList() {
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef();

  useEffect(() => {
    console.log(searchRef.current?.value);
  }, [searchValue]);

  return (
    <div className="py-1.5">
      <header>
        <Input
          customState={[searchValue, setSearchValue]}
          type="text"
          label="Search"
          icon={<IoSearch />}
          innerRef={searchRef}
        />
      </header>
      <main></main>
    </div>
  );
}
