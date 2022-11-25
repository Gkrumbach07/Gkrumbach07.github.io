import { useState, useEffect } from "react";

export type BreakpointValuesType = "xs" | "sm" | "md" | "lg" | "xl"

export const BREAKPOINTS = {
  values: {
    "xs": "0px",
    "sm": "750px",
    "md": "1050px",
    "lg": "1350px",
    "xl": "1536px",
  },
  up: (key: BreakpointValuesType) => `(min-width: ${BREAKPOINTS.values[key]})`,
  down: (key: BreakpointValuesType) => `(max-width: ${BREAKPOINTS.values[key]})`,
}

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);

  return matches;
}

export default useMediaQuery;