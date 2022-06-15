import { useContext, useEffect, useState } from 'react';
import { useRef } from 'react';
import { IoSearch } from 'react-icons/io5';
import { Link } from 'react-router-dom';

import { ModalContext } from '../../context/Modal/modalContext';
import RenderIf from '../../utils/RenderIf';
import Input from '../Input/Input';

export default function SearchList() {
  const [searchValue, setSearchValue] = useState('');
  const [SVPreview, setSVPreview] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const searchRef = useRef();

  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      setSVPreview(searchValue);
      isTyping && setIsTyping(false);
    }, 450);

    return () => {
      clearTimeout(searchDebounce);
      !isTyping && setIsTyping(true);
    };
  }, [searchValue]);

  return (
    <div className="py-1.5 space-y-5">
      <header className="sticky top-0 space-y-3  ">
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

        {/*  placeholder for when user is still typing */}
        <RenderIf conditionIs={isTyping}>
          <span>User Is Typing</span>
        </RenderIf>

        {/* results */}
        <RenderIf conditionIs={!isTyping}>
          <ul>
            <li>
              <Link
                // this link will open a modal containing info of the user (code is ini Menu.jsx)
                to="user/jesus"
                className={`cursor-pointer flex items-center gap-2 hover:bg-pink-100 p-2 duration-200 rounded-md`}
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
        </RenderIf>
      </main>
    </div>
  );
}
