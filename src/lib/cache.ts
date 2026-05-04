type CacheEntry<T> = {
  data: T
  expiresAt: number
}

class SimpleCache {
  private store = new Map<string, CacheEntry<unknown>>()

  set<T>(key: string, data: T, ttlSeconds = 60): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.data as T
  }

  invalidate(key: string): void {
    this.store.delete(key)
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key)
      }
    }
  }

  clear(): void {
    this.store.clear()
  }
}

// Singleton cache instance
export const cache = new SimpleCache()

// Cache TTL constants
export const TTL = {
  PRODUCTS: 300,      // 5 minutes
  CATEGORIES: 600,    // 10 minutes
  SETTINGS: 300,      // 5 minutes
  PARTNERS: 600,      // 10 minutes
  HOSPITALS: 600,     // 10 minutes
}
