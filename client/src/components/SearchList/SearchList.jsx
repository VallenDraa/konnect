import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { IoSearch } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import emptySearchResults from '../../svg/SearchList/emptySearchResults.svg';
import initialSvg from '../../svg/SearchList/initialSvg.svg';
import api from '../../utils/apiAxios/apiAxios';
import RenderIf from '../../utils/RenderIf';
import Input from '../Input/Input';

export default function SearchList() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [SVPreview, setSVPreview] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const searchRef = useRef();

  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      setSVPreview(query);
      setIsTyping(false);

      if (query === '') {
        return setSearchResults([]);
      }

      try {
        const { data } = await api.get(`/query/user/find_user?query=${query}`);
        setSearchResults(data);
      } catch (error) {
        console.log(error);
      }
    }, 450);

    return () => {
      clearTimeout(searchDebounce);
      setIsTyping(true);
    };
  }, [query]);

  return (
    <div className="py-1.5 space-y-5">
      <header className="sticky top-0 space-y-3  ">
        <Input
          labelActive={true}
          customState={[query, setQuery]}
          type="text"
          label="Search"
          icon={<IoSearch />}
          innerRef={searchRef}
        />
      </header>
      <main className="px-1 space-y-3">
        {/*  placeholder for when user is still typing */}
        <RenderIf conditionIs={isTyping}>
          <span>User Is Typing</span>
        </RenderIf>

        <RenderIf conditionIs={!isTyping}>
          <div>
            {/* search results info */}

            {/* this will appear when the user is done typing and the search value is not empty */}
            <RenderIf conditionIs={SVPreview !== ''}>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-gray-700 max-w-full truncate">
                  Results for <span className="italic ">{SVPreview}</span>
                </span>
                <span className="text-xxs text-gray-500">
                  {searchResults.length} results
                </span>
              </div>
            </RenderIf>

            {/* this svg will appear when the query is empty */}
            <RenderIf conditionIs={query === ''}>
              <div className="text-center space-y-10 mt-10">
                <img
                  src={initialSvg}
                  alt=""
                  className="max-w-[300px] mx-auto"
                />
                <span className="block font-semibold text-xl md:text-lg text-gray-500">
                  Search For Other People
                </span>
              </div>
            </RenderIf>
          </div>
          {/* results */}
          <ul>
            {/* the list item containing the user result */}
            <RenderIf conditionIs={searchResults.length !== 0}>
              {searchResults.map(({ username }, i) => (
                <li key={i}>
                  <Link
                    // this link will open a modal containing info of the user (code is ini Menu.jsx)
                    title={`Go To ${username}'s Profile`}
                    to={`user/${username}`}
                    className={`cursor-pointer flex items-center gap-2 hover:bg-pink-100 p-2 duration-200 rounded-md`}
                  >
                    <img
                      src="https://picsum.photos/200/200"
                      alt=""
                      className="rounded-full h-8 w-8"
                    />

                    <span className="text-sm">{username}</span>
                  </Link>
                </li>
              ))}
            </RenderIf>

            {/* svg for when there are no results*/}
            <RenderIf conditionIs={searchResults.length === 0 && query !== ''}>
              <li className="text-center space-y-10 mt-10">
                <img
                  src={emptySearchResults}
                  alt=""
                  className="max-w-[300px] mx-auto"
                />
                <span className="block font-semibold text-xl md:text-lg text-gray-500">
                  Welp we can't find anything :(
                </span>
              </li>
            </RenderIf>
          </ul>
        </RenderIf>
      </main>
    </div>
  );
}
