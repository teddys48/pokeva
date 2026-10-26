import { describe, expect, it, beforeEach } from 'bun:test';
import {
  isImageCached,
  markImageLoaded,
  clearImageCache,
} from '@/features/pokemon/usePokemonImage';

describe('usePokemonImage & Image Cache Utilities', () => {
  beforeEach(() => {
    clearImageCache();
  });

  describe('Session Cache (isImageCached, markImageLoaded, clearImageCache)', () => {
    it('returns false for uncached image URLs', () => {
      expect(isImageCached('https://raw.githubusercontent.com/sprites/1.png')).toBe(false);
      expect(isImageCached('')).toBe(false);
      expect(isImageCached(null)).toBe(false);
      expect(isImageCached(undefined)).toBe(false);
    });

    it('records successfully loaded image URLs and returns true on subsequent checks', () => {
      const url = 'https://raw.githubusercontent.com/sprites/25.png';
      expect(isImageCached(url)).toBe(false);

      markImageLoaded(url);
      expect(isImageCached(url)).toBe(true);
    });

    it('clears all cached URLs when clearImageCache is invoked', () => {
      markImageLoaded('https://raw.githubusercontent.com/sprites/1.png');
      markImageLoaded('https://raw.githubusercontent.com/sprites/4.png');
      expect(isImageCached('https://raw.githubusercontent.com/sprites/1.png')).toBe(true);
      expect(isImageCached('https://raw.githubusercontent.com/sprites/4.png')).toBe(true);

      clearImageCache();
      expect(isImageCached('https://raw.githubusercontent.com/sprites/1.png')).toBe(false);
      expect(isImageCached('https://raw.githubusercontent.com/sprites/4.png')).toBe(false);
    });

    it('ignores empty or null strings when marking images as loaded', () => {
      markImageLoaded('');
      markImageLoaded(null);
      markImageLoaded(undefined);
      expect(isImageCached('')).toBe(false);
    });
  });

  describe('Cached image resilience on back-navigation simulation', () => {
    it('maintains session cache across mock page transitions', () => {
      // Simulate user opening Pokédex catalogue: Bulbasaur (1) and Pikachu (25) load
      const bulbasaurUrl = 'https://raw.githubusercontent.com/sprites/1.png';
      const pikachuUrl = 'https://raw.githubusercontent.com/sprites/25.png';

      markImageLoaded(bulbasaurUrl);
      markImageLoaded(pikachuUrl);

      // User clicks Pokémon #25 -> navigates to detail page -> returns to Pokédex
      // When Pokédex re-mounts, cards can verify cached status immediately
      expect(isImageCached(bulbasaurUrl)).toBe(true);
      expect(isImageCached(pikachuUrl)).toBe(true);

      // Unvisited Pokémon #150 (Mewtwo) remains uncached until loaded
      expect(isImageCached('https://raw.githubusercontent.com/sprites/150.png')).toBe(false);
    });
  });
});
