import { useState } from 'react';
import { IoPeopleSharp } from 'react-icons/io5';
import findUsers from '../../../../utils/apis/findUsers';
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
      searchCb={findUsers}
      queryState={{ query, setQuery }}
      selectedState={{ selected, setSelected }}
      multipleSelect={true}
    />
  );
}
