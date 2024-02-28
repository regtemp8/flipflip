import createCache, { type EmotionCache } from "@emotion/cache";

export function createEmotionCache(nonce?: string): EmotionCache {
  return createCache({ key: "css", nonce });
}
