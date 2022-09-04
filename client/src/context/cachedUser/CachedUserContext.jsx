import { useEffect, useState } from "react";
import { createContext } from "react";
import getUsersPreview from "../../utils/apis/getusersPreview";
import _ from "lodash";

export const CACHED_USER_DEFAULT = {};

export const CachedUserContext = createContext(CACHED_USER_DEFAULT);

export default function CachedUserContextProvider({ children }) {
  const [cachedUsers, setCachedUsers] = useState(CACHED_USER_DEFAULT);

  // useEffect(() => console.log(cachedUsers), [cachedUsers]);

  const fetchCachedUsers = async (ids) => {
    if (typeof ids !== "string" && !Array.isArray(ids)) {
      return console.error("Please provide the correct parameter type");
    }
    const token = sessionStorage.getItem("token");

    switch (typeof ids) {
      case "string":
        const user = cachedUsers[ids];

        if (user) {
          return user;
        } else {
          const [newCachedUser] = await getUsersPreview(token, [ids]);
          setCachedUsers((prev) => ({ ...prev, [ids]: newCachedUser }));

          return newCachedUser;
        }

      case "object":
        const missing = [];
        const result = [];

        for (const id of ids) {
          const user = cachedUsers[ids];

          user ? result.push(user) : missing.push(id);
        }

        if (missing.length > 0) {
          const newCachedUsers = await getUsersPreview(token, [...missing]);

          result.push(...newCachedUsers);

          setCachedUsers((prev) => ({
            ...prev,
            ..._.keyBy(newCachedUsers, "._id"),
          }));

          return newCachedUsers;
        }

      default:
        return console.error("Please provide the correct parameter type");
    }
  };

  return (
    <CachedUserContext.Provider value={{ setCachedUsers, fetchCachedUsers }}>
      {children}
    </CachedUserContext.Provider>
  );
}
