// This file is needed to handle node-fetch v3 compatibility issues
import fetch from "node-fetch";

// Define DOMException for Node.js environment
class DOMException extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

// Define a type for fetch options
interface FetchOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  method?: string;
  body?: string;
}

// Create a type-safe wrapper for getJsonResponse
export async function fetchJson<T>(url: string, options?: FetchOptions): Promise<T> {
  const response = await fetch(url, options);

  // Check if the request was aborted
  if (options?.signal?.aborted) {
    throw new DOMException("Request aborted", "AbortError");
  }

  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.error("Invalid JSON response:", text.substring(0, 100) + "...");
    throw new Error("Invalid response from server");
  }
}

export { fetch };
