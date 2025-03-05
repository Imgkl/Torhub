import { getPreferenceValues, Icon, List, showToast, Toast } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { TorrentListItem } from "./components/TorrentListItem";
import { fetchTorrents, Torrent } from "./services/torrentApi";

const DEBUG = true;

// Define the preferences interface
interface Preferences {
  disclaimer: boolean;
}

enum SearchState {
  Initial = "initial",
  Searching = "searching",
  Results = "results",
}

export default function SearchTorrents() {
  const [searchText, setSearchText] = useState("");
  const [torrents, setTorrents] = useState<Torrent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchState, setSearchState] = useState<SearchState>(SearchState.Initial);

  // Get preferences
  const preferences = getPreferenceValues<Preferences>();
  const disclaimerAccepted = preferences.disclaimer;

  // Use a ref to track the current search query
  const currentSearchRef = useRef<string>("");
  // Use a ref to track the search abort controller
  const abortControllerRef = useRef<AbortController | null>(null);
  // Use a ref to track the current disclaimer state
  const disclaimerRef = useRef<boolean>(disclaimerAccepted);

  // Check if disclaimer has changed
  useEffect(() => {
    // Get the latest preference value
    const latestPreferences = getPreferenceValues<Preferences>();
    const latestDisclaimerAccepted = latestPreferences.disclaimer;

    // If the disclaimer state has changed
    if (disclaimerRef.current !== latestDisclaimerAccepted) {
      disclaimerRef.current = latestDisclaimerAccepted;

      // If disclaimer was unchecked, clear results
      if (!latestDisclaimerAccepted) {
        setTorrents([]);
        setSearchState(SearchState.Initial);

        // Cancel any ongoing search
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
      }
    }
  }, [searchText]); // Check on each search text change

  // Function to perform the search
  const performSearch = async (query: string) => {
    // Get the latest preference value
    const latestPreferences = getPreferenceValues<Preferences>();
    const latestDisclaimerAccepted = latestPreferences.disclaimer;
    disclaimerRef.current = latestDisclaimerAccepted;

    // If disclaimer was not accepted, don't search
    if (!latestDisclaimerAccepted) {
      setSearchState(SearchState.Initial);
      setTorrents([]);
      return;
    }

    // Check if the query is too short
    if (query.length < 3) {
      setSearchState(SearchState.Initial);
      setTorrents([]);

      // Cancel any ongoing search
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      return;
    }

    // Create a new abort controller for this search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // Update the current search ref
    currentSearchRef.current = query;

    setIsLoading(true);
    setSearchState(SearchState.Searching);
    setError(null);

    // Show toast with sources being searched
    showToast({
      style: Toast.Style.Animated,
      title: "Searching torrents...",
      message: `Sources: YTS, TPB Movies, TPB TV Shows`,
    });

    try {
      if (DEBUG) console.log(`Searching for: ${query}`);
      const results = await fetchTorrents(query, signal);

      // If this search has been aborted or the query has changed, don't update state
      if (signal.aborted || currentSearchRef.current !== query) return;

      if (DEBUG) {
        console.log(`Got ${results.length} results for "${query}"`);
        console.log(`Sources: ${Array.from(new Set(results.map((r) => r.website))).join(", ")}`);
      }

      // Update state with results
      setTorrents(results);
      setSearchState(results.length > 0 ? SearchState.Results : SearchState.Initial);

      // Show success toast
      showToast({
        style: Toast.Style.Success,
        title: `Found ${results.length} torrents`,
        message:
          results.length > 0
            ? `From ${Array.from(new Set(results.map((r) => r.website))).join(", ")}`
            : "Try a different search term",
      });
    } catch (error) {
      // Only show error if it's not an abort error
      if (error instanceof Error && error.name !== "AbortError") {
        console.error(error);
        setError("Failed to search. Please try again later.");
        setSearchState(SearchState.Initial);

        showToast({
          style: Toast.Style.Failure,
          title: "Search failed",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    } finally {
      // If this search has been aborted or the query has changed, don't update state
      if (!signal.aborted && currentSearchRef.current === query) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // Reset state when search text changes
    setError(null);

    // Debounce search
    const timeoutId = setTimeout(() => {
      if (searchText.trim().length >= 3) {
        performSearch(searchText);
      } else {
        setSearchState(SearchState.Initial);
        setTorrents([]);
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchText]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Render different content based on search state
  const renderContent = () => {
    // Get the latest preference value
    const latestPreferences = getPreferenceValues<Preferences>();
    const latestDisclaimerAccepted = latestPreferences.disclaimer;

    // If disclaimer was not accepted, show a message
    if (!latestDisclaimerAccepted) {
      return (
        <List.EmptyView
          title="Disclaimer Not Accepted"
          description="You must accept the disclaimer in the extension preferences to use TorHub."
          icon={Icon.ExclamationMark}
        />
      );
    }

    if (searchState === SearchState.Initial) {
      return (
        <List.EmptyView
          title="Search for Torrents"
          description="Enter at least 3 characters to search."
          icon={Icon.MagnifyingGlass}
        />
      );
    }

    if (error) {
      return <List.EmptyView title="No Results" description={error} icon={Icon.ExclamationMark} />;
    }

    if (searchState === SearchState.Searching && torrents.length === 0) {
      return (
        <List.EmptyView
          title="Searching..."
          description={`Searching YTS, TPB Movies, TPB TV Shows for "${searchText}"`}
          icon={Icon.Clock}
        />
      );
    }

    if (torrents.length === 0) {
      return (
        <List.EmptyView
          title="No Results Found"
          description="Try a different search term or check your internet connection."
          icon={Icon.ExclamationMark}
        />
      );
    }

    return torrents.map((torrent, index) => (
      <TorrentListItem key={`${torrent.magnetUrl}-${index}`} torrent={torrent} index={index} />
    ));
  };

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search for torrents"
      throttle
      isShowingDetail={searchState === SearchState.Results && torrents.length > 0}
    >
      {renderContent()}
    </List>
  );
}
