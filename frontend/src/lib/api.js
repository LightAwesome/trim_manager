// FILE: src/lib/api.js
const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL || !/^https?:\/\//i.test(BASE_URL)) {
  console.error(
    "❌ VITE_API_BASE_URL is missing or invalid. Please check your .env file."
  );
}

/**
 * Generic fetch wrapper with AbortController support and JSON parsing.
 * @param {string} endpoint - Relative endpoint (e.g. '/trims')
 * @param {RequestInit} [options={}] - Fetch options (method, body, headers, signal, etc.)
 * @returns {Promise<any>}
 */
async function api(endpoint, options = {}) {
  const { signal } = options;

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      signal,
    });

    if (signal?.aborted) return; // silently exit

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP ${res.status} - ${res.statusText}`
      );
    }

    if (res.status === 204) return null; // No content
    return res.json();
  } catch (err) {
    if (err.name === "AbortError") {
      return; // Don't throw on abort
    }
    console.error("API call failed:", err);
    throw err;
  }
}

// === Utility for query params ===
const buildQuery = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  return search ? `?${search}` : "";
};

// === Trims ===
export const getTrims = (params, signal) =>
  api(`/trims${buildQuery(params)}`, { signal });

export const getListingFullDetails = (adId, signal) =>
  api(`/listings/${adId}/details`, { signal });


export const createTrim = (body, signal) =>
  api("/trims", { method: "POST", body: JSON.stringify(body), signal });

// === Aliases ===
export const getAliases = (params, signal) =>
  api(`/aliases${buildQuery(params)}`, { signal });

export const createAlias = (body, signal) =>
  api("/aliases", { method: "POST", body: JSON.stringify(body), signal });

export const deleteAlias = (aliasId, signal) =>
  api(`/aliases/${aliasId}`, { method: "DELETE", signal });

// === Listings ===
export const processListings = (limit, signal) =>
  api("/process-listings", {
    method: "POST",
    body: JSON.stringify({ limit: parseInt(limit, 10) || 500 }),
    signal,
  });

export const getUnprocessedListings = (params, signal) =>
  api(`/listings/unprocessed${buildQuery(params)}`, { signal });

export const getProcessedListings = (params, signal) =>
  api(`/listings/processed${buildQuery(params)}`, { signal });

export const assignTrimToListing = (adId, body, signal) =>
  api(`/listings/${adId}/assign-trim`, {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });

export const reprocessListing = (adId, signal) =>
  api(`/listings/${adId}/reprocess`, { method: "POST", signal });

export const getListingCandidates = (adId, topN = 10, signal) =>
  api(`/listings/${adId}/candidates${buildQuery({ top_n: topN })}`, { signal });

export const markListingAsReviewed = (adId, body = {}, signal) =>
  api(`/listings/${adId}/reviewed`, {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });

// === Stats ===
export const getStats = (signal) => api("/stats", { signal });
