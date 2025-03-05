import { showToast, Toast } from "@raycast/api";
import { fetchJson } from "../utils/fetch";
import { getCategoryNameFromId } from "../utils/tpb-category";

// Define DOMException for Node.js environment
class DOMException extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

export interface Torrent {
  title: string;
  magnetUrl: string;
  seeders: number;
  leechers: number;
  website: string;
  size?: string;
  category?: string;
  dateUploaded?: string;
  imdbRating?: string;
  year?: string;
  thumbnail?: string;
}

// List of torrent search APIs we can use
const TORRENT_APIS = {
  YTS_PRIMARY: "https://yts.mx/api/v2/list_movies.json",
  YTS_MIRROR: "https://yts.am/api/v2/list_movies.json",
  YTS_PROXY: "https://yts.lt/api/v2/list_movies.json",
  TPB: "https://apibay.org/q.php?q=",
};

interface YTSResponse {
  status: string;
  data: {
    movie_count: number;
    limit: number;
    page_number: number;
    movies?: Array<{
      title_long: string;
      rating: number;
      year: number;
      medium_cover_image: string;
      torrents: Array<{
        hash: string;
        quality: string;
        type: string;
        seeds: number;
        peers: number;
        size: string;
        date_uploaded: string;
      }>;
    }>;
  };
}

interface TPBResponse
  extends Array<{
    id: string;
    name: string;
    info_hash: string;
    leechers: string;
    seeders: string;
    num_files: string;
    size: string;
    username: string;
    added: string;
    status: string;
    category: string;
    imdb: string;
  }> {}

/**
 * Search torrents using YTS API
 */
async function searchYTS(query: string, signal?: AbortSignal): Promise<Torrent[]> {
  // Try each YTS endpoint until one works
  const endpoints = [TORRENT_APIS.YTS_PRIMARY, TORRENT_APIS.YTS_MIRROR, TORRENT_APIS.YTS_PROXY];

  for (const endpoint of endpoints) {
    try {
      console.log(`Trying YTS endpoint: ${endpoint}`);

      // Use fetchJson instead of fetch + getJsonResponse
      const data = await fetchJson<YTSResponse>(
        `${endpoint}?query_term=${encodeURIComponent(query)}&limit=50&sort_by=download_count`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
            Accept: "application/json",
          },
          signal,
        },
      );

      if (data.status !== "ok" || !data.data.movies) {
        continue; // Try next endpoint
      }

      const torrents: Torrent[] = [];

      // YTS API returns movies with multiple quality options
      data.data.movies.forEach((movie) => {
        if (movie.torrents && movie.torrents.length > 0) {
          movie.torrents.forEach((torrent) => {
            // Create a magnet link from the hash
            const magnetUrl = `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(movie.title_long)}&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://p4p.arenabg.com:1337&tr=udp://tracker.leechers-paradise.org:6969`;

            torrents.push({
              title: `${movie.title_long} [${torrent.quality}] [${torrent.type}]`,
              magnetUrl,
              seeders: torrent.seeds,
              leechers: torrent.peers,
              website: "YTS",
              size: torrent.size,
              category: "Movies",
              dateUploaded: new Date(torrent.date_uploaded).toLocaleDateString(),
              imdbRating: movie.rating.toString(),
              year: movie.year.toString(),
              thumbnail: movie.medium_cover_image,
            });
          });
        }
      });

      if (torrents.length > 0) {
        return torrents;
      }
    } catch (error) {
      console.error(`Error searching YTS at ${endpoint}:`, error);
      // Continue to next endpoint
    }
  }

  // If all endpoints fail, return empty array
  return [];
}

/**
 * Search torrents using TPB API
 */
async function searchTPB(query: string, signal?: AbortSignal): Promise<Torrent[]> {
  try {
    console.log(`Searching TPB for: ${query}`);

    const data = await fetchJson<TPBResponse>(`${TORRENT_APIS.TPB}${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
        Accept: "application/json",
      },
      signal,
    });

    if (!data || data.length === 0 || data[0].id === "0") {
      return [];
    }

    return data.map((item) => {
      // Create magnet link
      const magnetUrl = `magnet:?xt=urn:btih:${item.info_hash}&dn=${encodeURIComponent(item.name)}&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://9.rarbg.to:2920/announce&tr=udp://tracker.opentrackr.org:1337&tr=udp://tracker.internetwarriors.net:1337/announce&tr=udp://tracker.leechers-paradise.org:6969/announce`;

      return {
        title: item.name,
        magnetUrl,
        seeders: parseInt(item.seeders),
        leechers: parseInt(item.leechers),
        website: "TPB",
        size: formatBytes(parseInt(item.size)),
        category: getCategoryNameFromId(parseInt(item.category)),
        dateUploaded: new Date(parseInt(item.added) * 1000).toLocaleDateString(),
      };
    });
  } catch (error) {
    console.error("Error searching TPB:", error);
    return [];
  }
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes: number): string {
  if (!bytes) return "Unknown";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Main function to search torrents from multiple sources
 */
export async function fetchTorrents(query: string, signal?: AbortSignal): Promise<Torrent[]> {
  if (!query || query.trim().length < 3) {
    return [];
  }

  // If the clean query is too short after removing filters
  if (query.length < 3) {
    showToast({
      style: Toast.Style.Failure,
      title: "Search Query Too Short",
      message: "Please enter at least 3 characters for your search term.",
    });
    return [];
  }

  try {
    // Determine which sources to search based on filters
    const searchPromises = [];
    const searchedSources = [];

    // Add search promises based on filters
    searchPromises.push(
      searchYTS(query, signal).catch((e) => {
        if (e.name === "AbortError") throw e;
        console.error("YTS error:", e);
        return [];
      }),
    );
    searchedSources.push("YTS");

    searchPromises.push(
      searchTPB(query + " movie", signal).catch((e) => {
        if (e.name === "AbortError") throw e;
        console.error("TPB movie error:", e);
        return [];
      }),
    );
    searchedSources.push("TPB Movies");

    searchPromises.push(
      searchTPB(query, signal).catch((e) => {
        if (e.name === "AbortError") throw e;
        console.error("TPB tv error:", e);
        return [];
      }),
    );
    searchedSources.push("TPB TV");

    // Execute all search promises in parallel
    const results = await Promise.all(searchPromises);

    // Check if the search was aborted
    if (signal?.aborted) {
      throw new DOMException("Search aborted", "AbortError");
    }

    // Flatten the results array
    const allResults = results.flat();

    console.log(`Total results: ${allResults.length}`);
    console.log(`Sources with results: ${Array.from(new Set(allResults.map((r) => r.website))).join(", ")}`);

    if (allResults.length === 0) {
      const message = "Try a different search term or check your internet connection.";

      showToast({
        style: Toast.Style.Failure,
        title: "No Results Found",
        message,
      });
      return [];
    }

    // Sort by seeders (highest first)
    return allResults.sort((a, b) => b.seeders - a.seeders);
  } catch (error: unknown) {
    // Rethrow AbortError to be handled by the caller
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    console.error("Error fetching torrents:", error);
    showToast({
      style: Toast.Style.Failure,
      title: "Search Failed",
      message: "Failed to search for torrents. Please try again later.",
    });

    return [];
  }
}
