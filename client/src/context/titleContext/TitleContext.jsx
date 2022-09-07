import { useEffect, createContext, useState } from "react";

const TITLE_DEFAULT = {
  prefix: "",
  main: "Konnect",
  suffix: "",
};

export const TitleContext = createContext("");

export default function TitleContextProvider({ children }) {
  const [title, setTitle] = useState(TITLE_DEFAULT);

  useEffect(() => {
    document.title = `${title.prefix}${title.main}${title.suffix}`;
  }, [title]);

  return (
    <TitleContext.Provider value={{ title, setTitle }}>
      {children}
    </TitleContext.Provider>
  );
}
