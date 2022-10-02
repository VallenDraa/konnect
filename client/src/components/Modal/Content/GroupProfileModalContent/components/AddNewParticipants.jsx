import { useState } from "react";
import { IoPersonAdd } from "react-icons/io5";
import api from "../../../../../utils/apiAxios/apiAxios";
import SearchBox from "../../../../template/SearchBox/SearchBox";

export default function AddNewParticipants() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);

  return (
    <SearchBox
      submitBtn={
        <>
          <IoPersonAdd />
          {selected.length >= 1 || selected.length === 0
            ? "Add Participant"
            : "Add Participants"}
        </>
      }
      searchCb={async (query) => {
        const { data } = await api.get(
          `/query/user/find_users?query=${query}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        return data;
      }}
      queryState={{ query, setQuery }}
      selectedState={{ selected, setSelected }}
      multipleSelect={false}
    />
  );
}
