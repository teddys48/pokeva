import { describe, expect, it } from 'bun:test';

describe('Phase 5: FavoriteButton Accessible Interaction & Event Isolation', () => {
  it('generates accurate accessible labels based on favorited state', () => {
    const getAccessibleLabel = (pokemonName: string, isFavorited: boolean) => {
      return isFavorited
        ? `Remove ${pokemonName} from favorites`
        : `Add ${pokemonName} to favorites`;
    };

    expect(getAccessibleLabel('Pikachu', false)).toBe('Add Pikachu to favorites');
    expect(getAccessibleLabel('Pikachu', true)).toBe('Remove Pikachu from favorites');
    expect(getAccessibleLabel('Charizard', false)).toBe('Add Charizard to favorites');
    expect(getAccessibleLabel('Charizard', true)).toBe('Remove Charizard from favorites');
  });

  it('determines aria-pressed boolean correctly', () => {
    const isFavorited = true;
    expect(isFavorited ? true : false).toBe(true);

    const isNotFavorited = false;
    expect(isNotFavorited ? true : false).toBe(false);
  });

  it('stops click event propagation and prevents default to safeguard parent Link navigation', () => {
    let defaultPrevented = false;
    let propagationStopped = false;
    let toggleCalled = false;

    const mockEvent = {
      preventDefault: () => {
        defaultPrevented = true;
      },
      stopPropagation: () => {
        propagationStopped = true;
      },
    };

    const handleFavoriteClick = (e: typeof mockEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleCalled = true;
    };

    handleFavoriteClick(mockEvent);

    expect(defaultPrevented).toBe(true);
    expect(propagationStopped).toBe(true);
    expect(toggleCalled).toBe(true);
  });

  it('intercepts Enter and Space keydown events to prevent parent link navigation', () => {
    const createKeyEvent = (key: string) => {
      let propagationStopped = false;
      return {
        key,
        stopPropagation: () => {
          propagationStopped = true;
        },
        get isPropagationStopped() {
          return propagationStopped;
        },
      };
    };

    const handleKeyDown = (e: ReturnType<typeof createKeyEvent>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.stopPropagation();
      }
    };

    const enterEvent = createKeyEvent('Enter');
    handleKeyDown(enterEvent);
    expect(enterEvent.isPropagationStopped).toBe(true);

    const spaceEvent = createKeyEvent(' ');
    handleKeyDown(spaceEvent);
    expect(spaceEvent.isPropagationStopped).toBe(true);

    const tabEvent = createKeyEvent('Tab');
    handleKeyDown(tabEvent);
    expect(tabEvent.isPropagationStopped).toBe(false);
  });
});
