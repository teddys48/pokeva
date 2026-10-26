import { useState, useEffect, useRef, useCallback } from 'react';

// Session-level memory cache for loaded image URLs
// Eliminates layout shifts and loading flashes on back-navigation or remounts
const loadedImageUrls = new Set<string>();

/**
 * Checks whether an image URL has already successfully loaded during this session.
 */
export function isImageCached(src?: string | null): boolean {
  if (!src) return false;
  return loadedImageUrls.has(src);
}

/**
 * Marks an image URL as successfully loaded in the session cache.
 */
export function markImageLoaded(src?: string | null): void {
  if (src) {
    loadedImageUrls.add(src);
  }
}

/**
 * Clears the session image cache. Primarily used in testing environments.
 */
export function clearImageCache(): void {
  loadedImageUrls.clear();
}

export interface UsePokemonImageOptions {
  primarySrc?: string | null;
  fallbackSrc?: string | null;
  identifier?: string | number;
}

export interface UsePokemonImageReturn {
  currentImgSrc: string;
  isLoaded: boolean;
  imageError: boolean;
  imgRef: (node: HTMLImageElement | null) => void;
  onLoad: (e?: React.SyntheticEvent<HTMLImageElement>) => void;
  onError: () => void;
}

/**
 * Robust hook for managing Pokémon artwork and sprite loading states.
 * Solves the critical issue where cached images on back-navigation do not emit
 * synthetic onLoad events in React, preventing stuck loading skeletons.
 */
export function usePokemonImage({
  primarySrc,
  fallbackSrc,
  identifier,
}: UsePokemonImageOptions): UsePokemonImageReturn {
  const initialTarget = primarySrc || fallbackSrc || '';
  const [currentImgSrc, setCurrentImgSrc] = useState(initialTarget);
  const [imageError, setImageError] = useState(false);
  // If the image was previously resolved in this session, initialize as loaded immediately
  const [isLoaded, setIsLoaded] = useState(() => isImageCached(initialTarget));

  const imgElementRef = useRef<HTMLImageElement | null>(null);

  const handleError = useCallback(() => {
    // If high-res artwork fails, try the secondary sprite fallback
    if (fallbackSrc && currentImgSrc !== fallbackSrc) {
      setCurrentImgSrc(fallbackSrc);
      if (isImageCached(fallbackSrc)) {
        setIsLoaded(true);
        setImageError(false);
      } else {
        setIsLoaded(false);
      }
    } else {
      // Both artwork and sprite failed or no fallback available
      setImageError(true);
      setIsLoaded(true);
    }
  }, [currentImgSrc, fallbackSrc]);

  const handleLoad = useCallback(
    (e?: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e?.currentTarget || imgElementRef.current;
      const resolvedSrc = target?.currentSrc || target?.src || currentImgSrc;
      if (resolvedSrc) {
        markImageLoaded(resolvedSrc);
      }
      setIsLoaded(true);
      setImageError(false);
    },
    [currentImgSrc]
  );

  // Synchronous callback ref check when DOM node mounts or updates
  // Catches images that were already marked complete by the browser before React commits
  const imgRef = useCallback(
    (node: HTMLImageElement | null) => {
      imgElementRef.current = node;
      if (!node) return;

      if (node.complete) {
        if (node.naturalWidth > 0) {
          markImageLoaded(node.currentSrc || node.src || currentImgSrc);
          setIsLoaded(true);
          setImageError(false);
        } else if (node.currentSrc || node.src) {
          handleError();
        }
      }
    },
    [currentImgSrc, handleError]
  );

  // Synchronize when image props or target Pokémon changes
  useEffect(() => {
    const target = primarySrc || fallbackSrc || '';
    if (!target) {
      setImageError(true);
      setIsLoaded(true);
      return;
    }

    if (target !== currentImgSrc) {
      setCurrentImgSrc(target);
      setImageError(false);
      if (isImageCached(target)) {
        setIsLoaded(true);
      } else {
        setIsLoaded(false);
      }
    } else {
      // Same source: check if already complete in DOM or session cache
      if (isImageCached(target)) {
        setIsLoaded(true);
      } else if (
        imgElementRef.current?.complete &&
        imgElementRef.current.naturalWidth > 0
      ) {
        markImageLoaded(target);
        setIsLoaded(true);
      }
    }
  }, [primarySrc, fallbackSrc, identifier, currentImgSrc]);

  // Direct native event listener fallback & BFCache (pageshow) handling
  useEffect(() => {
    const img = imgElementRef.current;
    if (!img) return;

    if (img.complete) {
      if (img.naturalWidth > 0) {
        markImageLoaded(img.currentSrc || img.src || currentImgSrc);
        setIsLoaded(true);
        setImageError(false);
      }
      return;
    }

    // Native fallback listeners in case React's synthetic onLoad doesn't fire
    const handleNativeLoad = () => {
      markImageLoaded(img.currentSrc || img.src || currentImgSrc);
      setIsLoaded(true);
      setImageError(false);
    };

    const handleNativeError = () => {
      handleError();
    };

    img.addEventListener('load', handleNativeLoad, { once: true });
    img.addEventListener('error', handleNativeError, { once: true });

    return () => {
      img.removeEventListener('load', handleNativeLoad);
      img.removeEventListener('error', handleNativeError);
    };
  }, [currentImgSrc, handleError]);

  // Back/forward navigation cache (BFCache) restoration listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePageShow = () => {
      const img = imgElementRef.current;
      if (img?.complete && img.naturalWidth > 0) {
        markImageLoaded(img.currentSrc || img.src || currentImgSrc);
        setIsLoaded(true);
        setImageError(false);
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [currentImgSrc]);

  return {
    currentImgSrc,
    isLoaded,
    imageError,
    imgRef,
    onLoad: handleLoad,
    onError: handleError,
  };
}
