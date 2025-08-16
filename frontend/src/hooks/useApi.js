// FILE: src/hooks/useApi.js
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook to call an API function with loading/error/data states and auto-cancel.
 * @param {Function} apiFunc - The API function to call (should accept signal as last arg)
 * @param {object} [options={}]
 * @param {boolean} [options.lazy=false] - If true, won't run on mount
 * @param {Array} [options.dependencies=[]] - Dependencies to re-run the request
 */
export default function useApi(apiFunc, { lazy = false, dependencies = [] } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!lazy);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const request = useCallback(
    async (...args) => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const result = await apiFunc(...args, abortRef.current.signal);
        setData(result ?? null);
        return result;
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err);
          throw err;
        }
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  useEffect(() => {
    if (!lazy) {
      request().catch(() => {});
    }
    return () => abortRef.current?.abort();
  }, [lazy, request, ...dependencies]);

  return { data, loading, error, request };
}
