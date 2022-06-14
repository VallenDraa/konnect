import { useContext, useEffect, useState } from 'react';
import { useRef } from 'react';
import { IoSearch } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import MODAL_ACTIONS from '../../context/Modal/modalActions';
import { ModalContext } from '../../context/Modal/modalContext';
import RenderIf from '../../utils/RenderIf';
import Input from '../Input/Input';

export default function SearchList() {
  const [searchValue, setSearchValue] = useState('');
  const [SVPreview, setSVPreview] = useState('');
  const { modalDispatch } = useContext(ModalContext);
  const searchRef = useRef();

  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      console.log(searchValue);
      setSVPreview(searchValue);
    }, 450);

    return () => clearTimeout(searchDebounce);
  }, [searchValue]);

  return (
    <div className="py-1.5 space-y-5">
      <header className="sticky top-0 space-y-3 bg-gray-100 hover:bg-gray-200 duration-200 p-3 rounded-md ">
        <Input
          labelActive={true}
          customState={[searchValue, setSearchValue]}
          type="text"
          label="Search"
          icon={<IoSearch />}
          innerRef={searchRef}
        />
      </header>
      <main className="px-1 space-y-3">
        {/* search results */}
        <div>
          <h1 className="font-semibold text-gray-700 max-w-full truncate">
            {SVPreview !== ''
              ? `Results for ${SVPreview}`
              : ' Search For Other People'}
          </h1>
          <RenderIf conditionIs={SVPreview !== ''}>
            <span className="text-xxs text-gray-500">50 results</span>
          </RenderIf>
        </div>
        {/* results */}
        <ul>
          <li>
            <Link
              to="user/jesus"
              className={`cursor-pointer flex items-center gap-2 hover:bg-pink-100 p-2 duration-200 rounded-md`}
              onClick={() => {
                modalDispatch({ type: MODAL_ACTIONS.show, content: null });
              }}
            >
              <img
                src="https://picsum.photos/200/200"
                alt=""
                className="rounded-full h-8 w-8"
              />

              <span className="text-sm">Jesus</span>
            </Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
