import { describe, expect, it } from 'bun:test';
import { MOCK_POKEMON_LIST } from '../mockPokemon';

describe('Mock Pokémon Dataset Integrity', () => {
  it('contains expected curated Pokémon', () => {
    expect(MOCK_POKEMON_LIST.length).toBeGreaterThanOrEqual(12);
  });

  it('ensures each Pokémon has required fields and valid stats', () => {
    for (const pokemon of MOCK_POKEMON_LIST) {
      expect(pokemon.id).toBeGreaterThan(0);
      expect(pokemon.name).toBeDefined();
      expect(pokemon.displayName).toBeDefined();
      expect(pokemon.types.length).toBeGreaterThanOrEqual(1);
      expect(pokemon.imageUrl).toContain('http');
      expect(pokemon.stats.length).toBe(6);
      expect(pokemon.height).toBeGreaterThan(0);
      expect(pokemon.weight).toBeGreaterThan(0);
    }
  });

  it('correctly filters Pokémon by query and type', () => {
    // Name filter
    const pikachuResults = MOCK_POKEMON_LIST.filter(p =>
      p.displayName.toLowerCase().includes('pika')
    );
    expect(pikachuResults.length).toBe(1);
    expect(pikachuResults[0].displayName).toBe('Pikachu');

    // ID filter
    const id25Results = MOCK_POKEMON_LIST.filter(p => p.id === 25);
    expect(id25Results.length).toBe(1);
    expect(id25Results[0].name).toBe('pikachu');

    // Type filter
    const fireResults = MOCK_POKEMON_LIST.filter(p => p.types.includes('fire'));
    expect(fireResults.length).toBe(2); // Charmander and Charizard
  });
});
