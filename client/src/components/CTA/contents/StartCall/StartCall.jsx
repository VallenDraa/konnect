import { useState } from 'react';
import { IoCall } from 'react-icons/io5';
import findUsers from '../../../../utils/apis/findUsers';
import SearchBox from '../../../template/SearchBox/SearchBox';

export default function StartCall() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);

  return (
    <SearchBox
      submitBtn={
        <>
          <IoCall />
          Start Call
        </>
      }
      searchCb={findUsers}
      queryState={{ query, setQuery }}
      selectedState={{ selected, setSelected }}
      multipleSelect={false}
    />
  );
}
