import { useContext } from "react";
import WatchlistContext from "../context/WatchlistContext.js";

function useWatchlist() {
  const context = useContext(WatchlistContext);

  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }

  return context;
}

export default useWatchlist;
