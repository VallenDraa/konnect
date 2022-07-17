import { useState } from 'react';
import { IoPeopleSharp } from 'react-icons/io5';
import findUsersFromContact from '../../../../utils/apis/findUsersFromContact';
import SearchBox from '../../../template/SearchBox/SearchBox';

export default function NewGroup() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);

  return (
    <SearchBox
      submitBtn={
        <>
          <IoPeopleSharp />
          Start Group
        </>
      }
      searchCb={(query) =>
        findUsersFromContact(query, sessionStorage.getItem('token'))
      }
      queryState={{ query, setQuery }}
      selectedState={{ selected, setSelected }}
      multipleSelect={true}
    />
  );
}
