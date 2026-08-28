import { useEffect } from "react";
import { useMatches } from "react-router-dom";

type RouteHandle = {
  title?: string;
};

export default function DocumentTitle() {
  const matches = useMatches();

  useEffect(() => {
    const title = matches
      .map((match) => (match.handle as RouteHandle | undefined)?.title)
      .filter((value): value is string => Boolean(value))
      .at(-1);

    document.title = title ? `${title} · Vaxify` : "Vaxify";
  }, [matches]);

  return null;
}
