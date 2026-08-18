const RECENT_PRODUCTS_KEY = 'meridian:recently-viewed'
const RECENT_SEARCHES_KEY = 'meridian:recent-searches'
const MAX_ITEMS = 8

export function trackRecentlyViewed(productId: string) {
  try {
    const raw = localStorage.getItem(RECENT_PRODUCTS_KEY)
    const list: string[] = raw ? JSON.parse(raw) : []
    const next = [productId, ...list.filter((id) => id !== productId)].slice(0, MAX_ITEMS)
    localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(next))
  } catch {
    // storage unavailable — ignore
  }
}

export function getRecentlyViewed(excludeId?: string): string[] {
  try {
    const raw = localStorage.getItem(RECENT_PRODUCTS_KEY)
    const list: string[] = raw ? JSON.parse(raw) : []
    return list.filter((id) => id !== excludeId)
  } catch {
    return []
  }
}

export function trackRecentSearch(term: string) {
  const trimmed = term.trim()
  if (!trimmed) return
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    const list: string[] = raw ? JSON.parse(raw) : []
    const next = [trimmed, ...list.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch {
    // ignore
  }
}
