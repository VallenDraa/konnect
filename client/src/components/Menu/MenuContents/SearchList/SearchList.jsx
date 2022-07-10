import { useEffect, useReducer, useState } from 'react';
import { useRef } from 'react';
import { IoSearch } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import emptySearchResults from '../../../../svg/searchList/emptySearchResults.svg';
import initialSvg from '../../../../svg/searchList/contactList/InitialSvg.svg';
import api from '../../../../utils/apiAxios/apiAxios';
import RenderIf from '../../../../utils/React/RenderIf';
import Input from '../../../Input/Input';
import searchResultsReducer, {
  SEARCH_RESULTS_ACTIONS,
  SEARCH_RESULTS_DEFAULT,
} from '../../../../reducer/searchResultsReducer/searchResultsReducer';

export default function SearchList() {
  const [query, setQuery] = useState('');
  const [searchResults, searchResultsDispatch] = useReducer(
    searchResultsReducer,
    SEARCH_RESULTS_DEFAULT
  );
  const [SVPreview, setSVPreview] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      setSVPreview(query);
      setIsTyping(false);
      searchResultsDispatch({ type: SEARCH_RESULTS_ACTIONS.start });

      if (query === '')
        return searchResultsDispatch({
          type: SEARCH_RESULTS_ACTIONS.loaded,
          payload: [],
        });

      try {
        searchResultsDispatch({ type: SEARCH_RESULTS_ACTIONS.loading });

        const { data } = await api.get(`/query/user/find_users?query=${query}`);
        searchResultsDispatch({
          type: SEARCH_RESULTS_ACTIONS.loaded,
          payload: data,
        });
      } catch (error) {
        searchResultsDispatch({
          type: SEARCH_RESULTS_ACTIONS.error,
          payload: error,
        });
        console.log(error);
      }
    }, 450);

    return () => {
      clearTimeout(searchDebounce);
      setIsTyping(true);
    };
  }, [query]);

  // useEffect(() => {
  //   console.log(searchResults);
  // }, [searchResults]);

  return (
    <section aria-label="searchList" className="py-1.5 space-y-5">
      <header className="sticky top-0 space-y-3 bg-gray-50 pt-2">
        <Input
          labelActive={true}
          customState={[query, setQuery]}
          type="text"
          label="Search"
          icon={<IoSearch />}
        />
      </header>
      <main className="px-1 space-y-3">
        {/*  placeholder for when user is still typing */}
        <RenderIf conditionIs={isTyping || searchResults.loading}>
          <span>Loading</span>
        </RenderIf>

        <RenderIf conditionIs={!isTyping && !searchResults.loading}>
          <div>
            {/* search results info */}

            {/* this will appear when the user is done typing and the search value is not empty */}
            <RenderIf conditionIs={SVPreview !== ''}>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-gray-700 max-w-full truncate">
                  Results for <span className="italic ">{SVPreview}</span>
                </span>
                <span className="text-xxs text-gray-500">
                  {searchResults.content?.length} results
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
                <span className="font-light text-gray-400 text-xs">
                  Go find another user and add them to your contact !
                </span>
              </div>
            </RenderIf>
          </div>
          {/* results */}
          <ul>
            {/* the list item containing the user result */}
            <RenderIf
              conditionIs={
                !searchResults.loading && searchResults.content?.length !== 0
              }
            >
              {searchResults.content?.map(({ username }, i) => {
                return (
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

                      <span className="text-sm truncate">{username}</span>
                    </Link>
                  </li>
                );
              })}
            </RenderIf>

            {/* svg for when there are no results*/}
            <RenderIf
              conditionIs={
                !searchResults.loading &&
                searchResults.content?.length === 0 &&
                query !== ''
              }
            >
              <li className="text-center space-y-10 mt-10">
                <img
                  src={emptySearchResults}
                  alt=""
                  className="max-w-[300px] mx-auto"
                />
                <span className="block font-semibold text-xl md:text-lg text-gray-600">
                  Welp nothing here :(
                </span>
                <span className="font-light text-gray-400 text-xs">
                  Try other keywords and maybe we can find something for you
                </span>
              </li>
            </RenderIf>
          </ul>
        </RenderIf>
      </main>
    </section>
  );
}
