import { describe, expect, it } from 'bun:test';
import { formatPokemonId, formatHeight, formatWeight, formatStatName, cn } from '../utils';
import { getTypeStyle, POKEMON_TYPE_STYLES } from '../../styles/typeColors';

describe('Utility Functions', () => {
  it('formats Pokemon IDs with leading zeroes', () => {
    expect(formatPokemonId(1)).toBe('#0001');
    expect(formatPokemonId(25)).toBe('#0025');
    expect(formatPokemonId(150)).toBe('#0150');
    expect(formatPokemonId(1025)).toBe('#1025');
  });

  it('formats height from decimetres to metres', () => {
    expect(formatHeight(4)).toBe('0.4 m');
    expect(formatHeight(17)).toBe('1.7 m');
  });

  it('formats weight from hectograms to kilograms', () => {
    expect(formatWeight(60)).toBe('6.0 kg');
    expect(formatWeight(905)).toBe('90.5 kg');
  });

  it('formats stat names correctly', () => {
    expect(formatStatName('hp')).toBe('HP');
    expect(formatStatName('attack')).toBe('Attack');
    expect(formatStatName('special-attack')).toBe('Sp. Atk');
    expect(formatStatName('special-defense')).toBe('Sp. Def');
    expect(formatStatName('speed')).toBe('Speed');
  });

  it('combines classes properly with cn', () => {
    expect(cn('px-2', 'py-1', { 'text-red-500': true, 'hidden': false })).toBe('px-2 py-1 text-red-500');
    expect(cn('p-4', 'p-2')).toBe('p-2'); // Tailwind merge deduplication
  });
});

describe('Type Colors Design System', () => {
  it('supports all 18 official Pokémon types', () => {
    const types = Object.keys(POKEMON_TYPE_STYLES);
    expect(types.length).toBe(18);
  });

  it('returns valid tokens for known and fallback types', () => {
    const electric = getTypeStyle('electric');
    expect(electric.label).toBe('Electric');
    expect(electric.bgHex).toBe('#CA8A04');

    const unknown = getTypeStyle('cosmic');
    expect(unknown.name).toBe('normal');
  });
});
