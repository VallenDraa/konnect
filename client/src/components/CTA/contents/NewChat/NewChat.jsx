import { useState } from "react";
import SearchBox from "../../../template/SearchBox/SearchBox";

export default function NewChat() {
  const [query, setQuery] = useState("");

  return <SearchBox query={query} setQuery={setQuery} multipleSelect={false} />;
}
