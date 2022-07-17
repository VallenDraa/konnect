import { useState } from 'react';
import { IoCall } from 'react-icons/io5';
import findUsersFromContact from '../../../../utils/apis/findUsersFromContact';
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
      searchCb={(query) =>
        findUsersFromContact(query, sessionStorage.getItem('token'))
      }
      queryState={{ query, setQuery }}
      selectedState={{ selected, setSelected }}
      multipleSelect={false}
    />
  );
}
