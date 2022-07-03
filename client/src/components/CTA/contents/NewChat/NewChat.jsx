import { useState } from 'react';
import { IoChatbubbles } from 'react-icons/io5';
import findUsers from '../../../../utils/apis/findUsers';
import SearchBox from '../../../template/SearchBox/SearchBox';

export default function NewChat() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);

  return (
    <SearchBox
      submitBtn={
        <>
          <IoChatbubbles />
          Start Chat
        </>
      }
      searchCb={findUsers}
      queryState={{ query, setQuery }}
      selectedState={{ selected, setSelected }}
      multipleSelect={false}
    />
  );
}
