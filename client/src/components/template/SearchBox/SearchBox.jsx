import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import Input from "../../Input/Input";

export default function SearchBox({
  query,
  setQuery,
  multipleSelect,
  searchCb,
  selectedCb,
}) {
  const [selected, setSelected] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // will perform search callback
  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      setIsTyping(false);
      if (query !== "") searchCb && searchCb(query);
      console.log(query);
    }, 450);

    return () => {
      clearTimeout(searchDebounce);
      setIsTyping(true);
    };
  }, [query]);

  // will execute everytime the selected state is changed
  useEffect(() => selectedCb && selectedCb(selected), [selected]);

  return (
    <div className="w-screen md:w-[40rem] flex flex-col h-full text-gray-800">
      <header className="px-4 flex flex-col gap-y-2 basis-1/4">
        <h2 className="font-semibold text-xl">Search For People</h2>
        <Input
          className="focus:bg-gray-100 px-1 pt-1"
          labelActive={true}
          customState={[query, setQuery]}
          type="text"
          label="Search"
          icon={<IoSearch />}
        />
      </header>
      {/* where the results will show up */}
      <main></main>
      <footer></footer>
    </div>
  );
}
