import { useContext, useEffect, useReducer, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import api from "../../../../utils/apiAxios/apiAxios";
import RenderIf from "../../../../utils/React/RenderIf";
import Input from "../../../Input/Input";
import searchResultsReducer, {
  SEARCH_RESULTS_ACTIONS,
  SEARCH_RESULTS_DEFAULT,
} from "../../../../reducer/searchResultsReducer/searchResultsReducer";
import { FaUserAlt } from "react-icons/fa";
import { SettingsContext } from "../../../../context/settingsContext/SettingsContext";
import PP from "../../../PP/PP";
import LoadingSpinner from "../../../LoadingSpinner/LoadingSpinner";

export default function SearchList() {
  const [query, setQuery] = useState("");
  const [searchResults, searchResultsDispatch] = useReducer(
    searchResultsReducer,
    SEARCH_RESULTS_DEFAULT
  );
  const [SVPreview, setSVPreview] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
  const location = useLocation();

  useEffect(() => setQuery(""), [location]);

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
    <section
      aria-label="search-list"
      className="flex flex-col min-h-full py-1.5 px-3 gap-y-3"
    >
      <header className="flex flex-col basis-14 sticky top-0 gap-y-5 pt-2">
        <Input
          labelActive={true}
          customState={[query, setQuery]}
          type="text"
          label="Search"
          icon={<IoSearch />}
        />
        {/* this will appear when the user is done typing and the search value is not empty */}
        <RenderIf conditionIs={SVPreview !== ""}>
          <div
            className={`flex flex-col gap-1 sticky top-0 ${
              general?.animation ? "animate-fade-in" : ""
            }`}
          >
            <span className="font-semibold text-gray-700 max-w-full truncate">
              Results for <span className="italic ">{SVPreview}</span>
            </span>
            <span className="text-xxs text-gray-500">
              {searchResults.content?.length} results
            </span>
          </div>
        </RenderIf>
      </header>
      <main className="relative flex flex-col grow">
        {/*  placeholder for when user is still typing */}
        <RenderIf conditionIs={isTyping || searchResults.loading}>
          <div className="mt-6">
            <LoadingSpinner />
          </div>
        </RenderIf>
        <RenderIf conditionIs={!isTyping && !searchResults.loading}>
          <div>
            {/* this svg will appear when the query is empty */}
            <RenderIf conditionIs={query === ""}>
              <div
                className={`text-center space-y-10 mt-10 overflow-x-hidden ${
                  general?.animation ? "animate-fade-in" : ""
                }`}
              >
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
          <ul className="space-y-3 overflow-y-auto absolute inset-0 mb-3">
            {/* the list item containing the user result */}
            <RenderIf
              conditionIs={
                !searchResults.loading && searchResults.content?.length !== 0
              }
            >
              {searchResults.content?.map(({ username, profilePicture }, i) => (
                <li
                  className={`${
                    general?.animation ? "animate-d-down-open" : ""
                  }`}
                  key={i}
                >
                  <Link
                    // this link will open a modal containing info of the user (code is ini Menu.jsx)
                    title={`Go To ${username}'s Profile`}
                    to={`user/${username}`}
                    className={`group cursor-pointer flex items-center gap-2 hover:bg-pink-100 bg-gray-100 p-2 rounded-lg shadow ${
                      general?.animation ? "duration-200" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 grow border-r-2 group-hover:border-pink-200">
                      <PP
                        src={profilePicture || null}
                        alt={username}
                        type="private"
                        className="rounded-full h-12 w-12"
                      />
                      <span className="text-lg truncate font-medium group-hover:text-pink-700">
                        {username}
                      </span>
                    </div>
                    <FaUserAlt className="ml-auto mr-1 text-gray-500 group-hover:text-pink-500" />
                  </Link>
                </li>
              ))}
            </RenderIf>

            {/* svg for when there are no results*/}
            <RenderIf
              conditionIs={
                !searchResults.loading &&
                searchResults.content?.length === 0 &&
                query !== ""
              }
            >
              <li
                className={`text-center space-y-10 mt-10 ${
                  general?.animation ? "animate-fade-in" : ""
                }`}
              >
                <span className="block font-semibold text-xl lg:text-lg text-gray-600">
                  No Results Found
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
