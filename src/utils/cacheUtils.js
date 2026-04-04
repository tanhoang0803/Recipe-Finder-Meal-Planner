const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export function isCacheValid(timestamp) {
  return Date.now() - timestamp < CACHE_TTL;
}

export function makeCacheKey(query, options = {}) {
  return JSON.stringify({ query, ...options });
}
