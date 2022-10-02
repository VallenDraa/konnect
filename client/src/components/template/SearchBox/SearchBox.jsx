import { useContext, useReducer } from "react";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { SettingsContext } from "../../../context/settingsContext/SettingsContext";
import searchResultsReducer, {
  SEARCH_RESULTS_ACTIONS,
  SEARCH_RESULTS_DEFAULT,
} from "../../../reducer/searchResultsReducer/searchResultsReducer";
import ContactsSwiperCard from "../../../utils/ContactsSwiperCard/ContactsSwiperCard";
import RenderIf from "../../../utils/React/RenderIf";
import Pill from "../../Buttons/Pill";
import Input from "../../Input/Input";

export default function SearchBox({
  multipleSelect = false,
  searchCb,
  selectedCb,
  submitCb,
  submitBtn,
}) {
  // the object structure
  // [{user: { initials, username, profilePicture }}]

  const [results, resultsDispatch] = useReducer(
    searchResultsReducer,
    SEARCH_RESULTS_DEFAULT
  );
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;

  // will perform search callback
  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      try {
        setIsTyping(false);

        resultsDispatch({ type: SEARCH_RESULTS_ACTIONS.start });

        if (!searchCb) {
          return resultsDispatch({
            type: SEARCH_RESULTS_ACTIONS.loaded,
            payload: [],
          });
        }

        resultsDispatch({ type: SEARCH_RESULTS_ACTIONS.loading });

        const payload = await searchCb(query);
        // console.log(payload);
        resultsDispatch({
          type: SEARCH_RESULTS_ACTIONS.loaded,
          payload,
        });
      } catch (error) {
        resultsDispatch({ type: SEARCH_RESULTS_ACTIONS.error, payload: error });
      }
    }, 450);

    return () => {
      clearTimeout(searchDebounce);
      setIsTyping(true);
    };
  }, [query]);

  // will execute everytime the selected state is changed
  useEffect(() => selectedCb && selectedCb(selected), [selected]);

  const handleSelect = (userArg) => {
    if (!userArg || Object.keys(userArg).length === 0) return;

    const hasBeenSelected = selected.some(({ user }) => {
      return user.username === userArg.username;
    });

    setSelected((old) => {
      const newUser = { user: userArg };
      return hasBeenSelected
        ? old.filter(({ user }) => user.username !== userArg.username)
        : multipleSelect
        ? [...old, newUser]
        : [newUser];
    });
  };

  const handleSubmit = (results, query, selected) => {
    submitCb && submitCb(results, query, selected);

    // re-enable Y axis scrolling because clicking the button that runs this function will close the modal
    // if (selected.length > 0) document.body.style.overflowY = 'auto';
  };

  return (
    <div className="w-screen lg:w-[40rem] flex flex-col min-h-full text-gray-800 space-y-2 bg-white max-w-screen-sm">
      <header className="px-6 flex flex-col gap-y-2">
        <div className="flex flex-wrap justify-between items-center">
          <h2 className="font-semibold text-xl">Search For People</h2>
          <Pill
            onClick={() => handleSubmit(results, query, selected)}
            className="w-[150px] text-sm font-medium shadow hover:shadow-lg hover:shadow-blue-100 bg-gray-200 hover:bg-blue-400 active:bg-blue-500 hover:text-white"
          >
            {submitBtn}
          </Pill>
        </div>
        <div>
          <Input
            className="px-1 pt-1"
            labelActive={true}
            customState={[query, setQuery]}
            type="text"
            label="Search"
            icon={<IoSearch />}
          />
        </div>
      </header>
      {/* where the results will show up */}
      <main className="overflow-y-auto grow w-full">
        {/* if user is typing */}
        <RenderIf conditionIs={isTyping || results.loading}>loading</RenderIf>
        {/* if user is not typing */}
        <RenderIf conditionIs={!isTyping}>
          <ul className="h-0">
            {/* if the result is not empty*/}
            <RenderIf
              conditionIs={!results.loading && results.content?.length !== 0}
            >
              {results.content?.map(({ user }, i) => {
                return (
                  <li
                    key={i}
                    onClick={() => handleSelect(user)}
                    className={`cursor-pointer hover:bg-pink-100 rounded-sm flex ${
                      general?.animation ? "animate-fade-in duration-200" : ""
                    }`}
                  >
                    <button className="flex items-center gap-2 py-2 px-5 grow">
                      <img
                        src="https://picsum.photos/200/200"
                        alt=""
                        className="rounded-full h-12 w-12"
                      />

                      <span className="font-semibold text-lg truncate">
                        {user.username}
                      </span>
                    </button>
                  </li>
                );
              })}
            </RenderIf>

            {/* if results are empty */}
            <RenderIf
              conditionIs={!results.loading && results.content?.length === 0}
            >
              <li className="text-center space-y-10 mt-10">
                <span className="block font-semibold text-xl lg:text-lg text-gray-600">
                  Welp nothing here :(
                </span>
                <span className="text-gray-400 text-xs">
                  Try other keywords and maybe we can find something for you
                </span>
              </li>
            </RenderIf>
          </ul>
        </RenderIf>
      </main>

      {/* where the selected would go */}
      <footer className="basis-1/6 w-full py-2 px-4 bg-gray-200 shadow-inner shadow-gray-100 mt-auto">
        <h3 className="font-bold text-sm">Selected ({selected.length}):</h3>
        <div className="mt-1">
          <ContactsSwiperCard
            itemWidth={60}
            linkable={false}
            contacts={selected}
            mini={true}
            onItemClicked={handleSelect}
          />
        </div>
      </footer>
    </div>
  );
}
