import { useState } from "react";
import { createContext } from "react";

export const CACHED_USER_DEFAULT = {};

export const CachedUserContext = createContext(CACHED_USER_DEFAULT);

export default function CachedUserContextProvider({ children }) {
  const [cachedUsers, setCachedUsers] = useState(CACHED_USER_DEFAULT);

  const fetchUsers = async (ids) => {};

  return (
    <CachedUserContext.Provider value={{ cachedUsers, setCachedUsers }}>
      {children}
    </CachedUserContext.Provider>
  );
}
