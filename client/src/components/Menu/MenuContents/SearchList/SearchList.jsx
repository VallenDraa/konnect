import { useEffect, useReducer, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { Link } from "react-router-dom";
import emptySearchResults from "../../../../svg/searchList/emptySearchResults.svg";
import initialSvg from "../../../../svg/searchList/contactList/InitialSvg.svg";
import api from "../../../../utils/apiAxios/apiAxios";
import RenderIf from "../../../../utils/React/RenderIf";
import Input from "../../../Input/Input";
import searchResultsReducer, {
  SEARCH_RESULTS_ACTIONS,
  SEARCH_RESULTS_DEFAULT,
} from "../../../../reducer/searchResultsReducer/searchResultsReducer";
import { FaUserAlt } from "react-icons/fa";

export default function SearchList() {
  const [query, setQuery] = useState("");
  const [searchResults, searchResultsDispatch] = useReducer(
    searchResultsReducer,
    SEARCH_RESULTS_DEFAULT
  );
  const [SVPreview, setSVPreview] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      setSVPreview(query);
      setIsTyping(false);
      searchResultsDispatch({ type: SEARCH_RESULTS_ACTIONS.start });

      if (query === "")
        return searchResultsDispatch({
          type: SEARCH_RESULTS_ACTIONS.loaded,
          payload: [],
        });

      try {
        searchResultsDispatch({ type: SEARCH_RESULTS_ACTIONS.loading });

        const { data } = await api.get(
          `/query/user/find_users?query=${query}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
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
    <section aria-label="searchList" className="py-1.5 px-3 space-y-5">
      <header className="sticky top-0 space-y-3  pt-2">
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
            {/* this will appear when the user is done typing and the search value is not empty */}
            <RenderIf conditionIs={SVPreview !== ""}>
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
            <RenderIf conditionIs={query === ""}>
              <div className="text-center space-y-10 mt-10 overflow-x-hidden">
                <span className="block font-semibold text-xl lg:text-lg text-gray-500">
                  Find others and Konnect !
                </span>
                <span className="font-light text-gray-400 text-xs">
                  Search for new people
                </span>
              </div>
            </RenderIf>
          </div>
          {/* results */}
          <ul className="space-y-3">
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
                      className={`group cursor-pointer flex items-center gap-2 hover:bg-pink-100 bg-gray-100 p-2 duration-200 rounded-lg shadow`}
                    >
                      <div className="flex items-center gap-2 grow border-r-2 group-hover:border-pink-200">
                        <img
                          src="https://picsum.photos/200/200"
                          alt=""
                          className="rounded-full h-12 w-12"
                        />

                        <span className="text-lg truncate font-medium group-hover:text-pink-700">
                          {username}
                        </span>
                      </div>
                      <FaUserAlt className="ml-auto mr-1 text-gray-500 group-hover:text-pink-500" />
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
                query !== ""
              }
            >
              <li className="text-center space-y-10 mt-10">
                <span className="block font-semibold text-xl lg:text-lg text-gray-600">
                  Welp nothing here :(
                </span>
                <span className="font-light text-gray-400 text-xs">
                  Try other keywords...
                </span>
              </li>
            </RenderIf>
          </ul>
        </RenderIf>
      </main>
    </section>
  );
}
