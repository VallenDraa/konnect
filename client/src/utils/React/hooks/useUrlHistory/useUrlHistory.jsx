import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function useUrlHistory() {
  const location = useLocation();
  const [UrlHistory, setUrlHistory] = useState({ prev: null, current: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    const UrlPath = location.pathname + location.search;

    try {
      setUrlHistory((state) => ({
        prev: state.current ? state.current : '/',
        current: UrlPath,
      }));
    } catch (e) {
      setError(e);
    }
  }, [location]);

  // useEffect(() => console.log(UrlHistory), [UrlHistory]);

  return [UrlHistory, error];
}
