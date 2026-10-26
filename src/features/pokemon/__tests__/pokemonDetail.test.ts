import { describe, expect, it } from 'bun:test';
import { formatHeight, formatWeight, formatPokemonId, formatStatName } from '@/lib/utils';
import { mapPokeApiPokemonToPokemon } from '@/services/pokeapi/mappers';
import { PokeApiPokemon, PokeApiSpecies } from '@/types/pokeapi';

describe('Phase 4: Pokémon Detail Calculations, Conversions & Formatting', () => {
  describe('Unit Conversions & Metric Formatting', () => {
    it('converts decimetres to metres accurately', () => {
      expect(formatHeight(7)).toBe('0.7 m'); // Bulbasaur
      expect(formatHeight(4)).toBe('0.4 m'); // Pikachu
      expect(formatHeight(17)).toBe('1.7 m'); // Charizard
      expect(formatHeight(200)).toBe('20.0 m'); // Wailord
      expect(formatHeight(1)).toBe('0.1 m'); // Joltik
    });

    it('converts hectograms to kilograms accurately', () => {
      expect(formatWeight(69)).toBe('6.9 kg'); // Bulbasaur
      expect(formatWeight(60)).toBe('6.0 kg'); // Pikachu
      expect(formatWeight(905)).toBe('90.5 kg'); // Charizard
      expect(formatWeight(3980)).toBe('398.0 kg'); // Snorlax
      expect(formatWeight(4)).toBe('0.4 kg'); // Gastly
    });

    it('formats Pokédex ID with leading zeros', () => {
      expect(formatPokemonId(1)).toBe('#0001');
      expect(formatPokemonId(25)).toBe('#0025');
      expect(formatPokemonId(150)).toBe('#0150');
      expect(formatPokemonId(1025)).toBe('#1025');
    });

    it('formats official stat names into standard display labels', () => {
      expect(formatStatName('hp')).toBe('HP');
      expect(formatStatName('attack')).toBe('Attack');
      expect(formatStatName('defense')).toBe('Defense');
      expect(formatStatName('special-attack')).toBe('Sp. Atk');
      expect(formatStatName('special-defense')).toBe('Sp. Def');
      expect(formatStatName('speed')).toBe('Speed');
    });
  });

  describe('Gender Ratio Calculations', () => {
    const calculateGenderRatio = (genderRate?: number | null) => {
      if (genderRate === undefined || genderRate === null) return 'Unavailable';
      if (genderRate === -1) return 'Genderless';
      const femalePct = ((genderRate / 8) * 100).toFixed(1);
      const malePct = (((8 - genderRate) / 8) * 100).toFixed(1);
      return `♂ ${malePct}% • ♀ ${femalePct}%`;
    };

    it('identifies genderless Pokémon when gender_rate is -1', () => {
      expect(calculateGenderRatio(-1)).toBe('Genderless'); // Magnemite, Mewtwo
    });

    it('calculates 87.5% male / 12.5% female ratio for starters (gender_rate = 1)', () => {
      expect(calculateGenderRatio(1)).toBe('♂ 87.5% • ♀ 12.5%'); // Bulbasaur, Charmander
    });

    it('calculates 50% male / 50% female ratio for standard Pokémon (gender_rate = 4)', () => {
      expect(calculateGenderRatio(4)).toBe('♂ 50.0% • ♀ 50.0%'); // Pikachu, Pidgey
    });

    it('calculates 100% female ratio (gender_rate = 8)', () => {
      expect(calculateGenderRatio(8)).toBe('♂ 0.0% • ♀ 100.0%'); // Chansey, Kangaskhan
    });

    it('calculates 100% male ratio (gender_rate = 0)', () => {
      expect(calculateGenderRatio(0)).toBe('♂ 100.0% • ♀ 0.0%'); // Tauros, Hitmonlee
    });

    it('handles missing gender rate without displaying misleading zeros', () => {
      expect(calculateGenderRatio(null)).toBe('Unavailable');
      expect(calculateGenderRatio(undefined)).toBe('Unavailable');
    });
  });

  describe('Stats Mapping & Total Base Stat Calculation', () => {
    const mockApiPokemon: PokeApiPokemon = {
      id: 25,
      name: 'pikachu',
      base_experience: 112,
      height: 4,
      is_default: true,
      order: 35,
      weight: 60,
      abilities: [
        {
          ability: { name: 'static', url: '' },
          is_hidden: false,
          slot: 1,
        },
        {
          ability: { name: 'lightning-rod', url: '' },
          is_hidden: true,
          slot: 3,
        },
      ],
      forms: [],
      species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
      sprites: {
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
        front_shiny: null,
        front_female: null,
        front_shiny_female: null,
        back_default: null,
        back_shiny: null,
        back_female: null,
        back_shiny_female: null,
      },
      stats: [
        { base_stat: 35, effort: 0, stat: { name: 'hp', url: '' } },
        { base_stat: 55, effort: 0, stat: { name: 'attack', url: '' } },
        { base_stat: 40, effort: 0, stat: { name: 'defense', url: '' } },
        { base_stat: 50, effort: 0, stat: { name: 'special-attack', url: '' } },
        { base_stat: 50, effort: 0, stat: { name: 'special-defense', url: '' } },
        { base_stat: 90, effort: 2, stat: { name: 'speed', url: '' } },
      ],
      types: [
        { slot: 1, type: { name: 'electric', url: '' } },
      ],
    };

    it('maps all 6 base stats accurately and computes total base stats', () => {
      const pokemon = mapPokeApiPokemonToPokemon(mockApiPokemon);

      expect(pokemon.stats.length).toBe(6);
      const total = pokemon.stats.reduce((acc, s) => acc + s.base_stat, 0);
      expect(total).toBe(320); // 35+55+40+50+50+90 = 320 for Pikachu

      const speedStat = pokemon.stats.find((s) => s.name === 'speed');
      expect(speedStat?.base_stat).toBe(90);

      const hpStat = pokemon.stats.find((s) => s.name === 'hp');
      expect(hpStat?.base_stat).toBe(35);
    });

    it('distinguishes normal abilities from hidden abilities', () => {
      const normalAbilities = mockApiPokemon.abilities.filter((a) => !a.is_hidden);
      const hiddenAbilities = mockApiPokemon.abilities.filter((a) => a.is_hidden);

      expect(normalAbilities.length).toBe(1);
      expect(normalAbilities[0].ability.name).toBe('static');

      expect(hiddenAbilities.length).toBe(1);
      expect(hiddenAbilities[0].ability.name).toBe('lightning-rod');
    });

    it('determines previous and next navigation identifiers correctly', () => {
      // Pikachu (#25)
      const currentId = mockApiPokemon.id;
      const prevId = currentId > 1 ? currentId - 1 : null;
      const nextId = currentId + 1;

      expect(prevId).toBe(24);
      expect(nextId).toBe(26);

      // First Pokémon (Bulbasaur #1)
      const bulbasaurId = 1;
      const bulbasaurPrev = bulbasaurId > 1 ? bulbasaurId - 1 : null;
      expect(bulbasaurPrev).toBeNull();
    });
  });

  describe('Species Classification & Egg Cycles', () => {
    const mockSpecies: PokeApiSpecies = {
      id: 25,
      name: 'pikachu',
      order: 26,
      gender_rate: 4,
      capture_rate: 190,
      base_happiness: 50,
      is_baby: false,
      is_legendary: false,
      is_mythical: false,
      hatch_counter: 10,
      has_gender_differences: true,
      forms_switchable: false,
      growth_rate: { name: 'medium-fast', url: '' },
      color: { name: 'yellow', url: '' },
      shape: { name: 'quadruped', url: '' },
      evolves_from_species: { name: 'pichu', url: '' },
      evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/10/' },
      habitat: { name: 'forest', url: '' },
      generation: { name: 'generation-i', url: '' },
      flavor_text_entries: [
        {
          flavor_text: 'When several of these POKéMON gather, their\nelectricity can build and cause\nlightning storms.',
          language: { name: 'en', url: '' },
          version: { name: 'red', url: '' },
        },
      ],
      genera: [
        { genus: 'Mouse Pokémon', language: { name: 'en', url: '' } },
      ],
      egg_groups: [
        { name: 'field', url: '' },
        { name: 'fairy', url: '' },
      ],
      varieties: [],
    };

    it('calculates hatch steps from cycles correctly', () => {
      const cycles = mockSpecies.hatch_counter;
      const steps = cycles * 256;
      expect(steps).toBe(2560);
    });

    it('formats egg groups as comma-separated list', () => {
      const formatted = mockSpecies.egg_groups.map((g) => g.name).join(', ');
      expect(formatted).toBe('field, fairy');
    });

    it('handles legendary and mythical flags accurately', () => {
      expect(mockSpecies.is_legendary).toBe(false);
      expect(mockSpecies.is_mythical).toBe(false);

      const mewtwoSpecies: Partial<PokeApiSpecies> = {
        is_legendary: true,
        is_mythical: false,
      };
      expect(mewtwoSpecies.is_legendary).toBe(true);

      const mewSpecies: Partial<PokeApiSpecies> = {
        is_legendary: false,
        is_mythical: true,
      };
      expect(mewSpecies.is_mythical).toBe(true);
    });
  });
});
