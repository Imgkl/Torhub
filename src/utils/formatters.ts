/**
 * Formats file size to a human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (!bytes) return "Unknown size";

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
 * Formats the torrent health based on seeders and leechers
 */
export function getTorrentHealth(seeders: number): "excellent" | "good" | "fair" | "poor" {
  if (seeders >= 80) return "excellent";
  if (seeders >= 50) return "good";
  if (seeders >= 20) return "fair";
  return "poor";
}

/**
 * Formats a category name to be more readable
 */
export function formatCategory(category: string): string {
  // Convert categories like "movies.x264" to "Movies (x264)"
  if (!category) return "";

  const parts = category.split(".");
  if (parts.length > 1) {
    return `${capitalizeFirstLetter(parts[0])} (${parts[1]})`;
  }

  return capitalizeFirstLetter(category);
}

/**
 * Capitalizes the first letter of a string
 */
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
