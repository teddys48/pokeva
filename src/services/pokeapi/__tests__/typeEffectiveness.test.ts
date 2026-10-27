import { describe, expect, it } from 'bun:test';
import {
  ALL_POKEMON_TYPES,
  calculateMatchupSummary,
  calculateSingleTypeMultiplier,
  calculateTypeEffectivenessMultiplier,
  formatMultiplier,
  getEffectivenessCategory,
  isValidPokemonType,
} from '../typeEffectiveness';
import { PokeApiType, PokeApiTypeDamageRelations } from '@/types/pokeapi';
import { isPokeApiError } from '../client';

/**
 * Fixture helper to create a mock PokeApiType with realistic damage relations.
 */
function createMockType(
  name: string,
  relations: Partial<{
    no_damage_from: string[];
    half_damage_from: string[];
    double_damage_from: string[];
    no_damage_to: string[];
    half_damage_to: string[];
    double_damage_to: string[];
  }> = {}
): PokeApiType {
  const mapResources = (names?: string[]) =>
    (names || []).map((n) => ({ name: n, url: `https://pokeapi.co/api/v2/type/${n}/` }));

  const damage_relations: PokeApiTypeDamageRelations = {
    no_damage_from: mapResources(relations.no_damage_from),
    half_damage_from: mapResources(relations.half_damage_from),
    double_damage_from: mapResources(relations.double_damage_from),
    no_damage_to: mapResources(relations.no_damage_to),
    half_damage_to: mapResources(relations.half_damage_to),
    double_damage_to: mapResources(relations.double_damage_to),
  };

  return {
    id: 1,
    name,
    damage_relations,
    pokemon: [],
    generation: { name: 'generation-i', url: 'https://pokeapi.co/api/v2/generation/1/' },
    move_damage_class: null,
    names: [{ name, language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' } }],
  };
}

// Canonical type fixtures based on official Pokémon damage relations
const grassType = createMockType('grass', {
  half_damage_from: ['water', 'electric', 'grass', 'ground'],
  double_damage_from: ['fire', 'ice', 'poison', 'flying', 'bug'],
  no_damage_from: [],
});

const waterType = createMockType('water', {
  half_damage_from: ['steel', 'fire', 'water', 'ice'],
  double_damage_from: ['grass', 'electric'],
  no_damage_from: [],
});

const fireType = createMockType('fire', {
  half_damage_from: ['bug', 'steel', 'fire', 'grass', 'ice', 'fairy'],
  double_damage_from: ['ground', 'rock', 'water'],
  no_damage_from: [],
});

const flyingType = createMockType('flying', {
  half_damage_from: ['grass', 'fighting', 'bug'],
  double_damage_from: ['electric', 'ice', 'rock'],
  no_damage_from: ['ground'],
});

const steelType = createMockType('steel', {
  half_damage_from: ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy'],
  double_damage_from: ['fire', 'fighting', 'ground'],
  no_damage_from: ['poison'],
});

const electricType = createMockType('electric', {
  half_damage_from: ['electric', 'flying', 'steel'],
  double_damage_from: ['ground'],
  no_damage_from: [],
});

const groundType = createMockType('ground', {
  half_damage_from: ['poison', 'rock'],
  double_damage_from: ['water', 'grass', 'ice'],
  no_damage_from: ['electric'],
});

const ghostType = createMockType('ghost', {
  half_damage_from: ['poison', 'bug'],
  double_damage_from: ['ghost', 'dark'],
  no_damage_from: ['normal', 'fighting'],
});

const normalType = createMockType('normal', {
  half_damage_from: [],
  double_damage_from: ['fighting'],
  no_damage_from: ['ghost'],
});

const poisonType = createMockType('poison', {
  half_damage_from: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
  double_damage_from: ['ground', 'psychic'],
  no_damage_from: [],
});

describe('Type Effectiveness Calculation Engine', () => {
  describe('Multiplier Formatting and Categorization', () => {
    it('formats multipliers into standard notation', () => {
      expect(formatMultiplier(0)).toBe('0×');
      expect(formatMultiplier(0.25)).toBe('¼×');
      expect(formatMultiplier(0.5)).toBe('½×');
      expect(formatMultiplier(1)).toBe('1×');
      expect(formatMultiplier(2)).toBe('2×');
      expect(formatMultiplier(4)).toBe('4×');
      expect(formatMultiplier(8)).toBe('8×');
    });

    it('categorizes multipliers accurately', () => {
      expect(getEffectivenessCategory(0)).toBe('immunity');
      expect(getEffectivenessCategory(0.25)).toBe('resistance');
      expect(getEffectivenessCategory(0.5)).toBe('resistance');
      expect(getEffectivenessCategory(1)).toBe('normal');
      expect(getEffectivenessCategory(2)).toBe('weakness');
      expect(getEffectivenessCategory(4)).toBe('weakness');
    });

    it('validates official Pokémon elemental types', () => {
      expect(isValidPokemonType('fire')).toBe(true);
      expect(isValidPokemonType('GRASS')).toBe(true);
      expect(isValidPokemonType(' fairy ')).toBe(true);
      expect(isValidPokemonType('stellar')).toBe(false);
      expect(isValidPokemonType('unknown')).toBe(false);
      expect(isValidPokemonType('')).toBe(false);
      expect(isValidPokemonType(null)).toBe(false);
      expect(isValidPokemonType(undefined)).toBe(false);
    });

    it('contains all 18 standard battle types', () => {
      expect(ALL_POKEMON_TYPES).toHaveLength(18);
      expect(ALL_POKEMON_TYPES).toContain('normal');
      expect(ALL_POKEMON_TYPES).toContain('fairy');
      expect(ALL_POKEMON_TYPES).toContain('steel');
      expect(ALL_POKEMON_TYPES).toContain('dragon');
    });
  });

  describe('Single-Type Defender Calculations', () => {
    it('calculates super effective weaknesses (2×)', () => {
      // Fire vs Grass = 2×
      expect(calculateSingleTypeMultiplier('fire', grassType)).toBe(2);
      // Water vs Fire = 2×
      expect(calculateSingleTypeMultiplier('water', fireType)).toBe(2);
      // Electric vs Water = 2×
      expect(calculateSingleTypeMultiplier('electric', waterType)).toBe(2);
    });

    it('calculates not very effective resistances (½×)', () => {
      // Fire vs Water = 0.5×
      expect(calculateSingleTypeMultiplier('fire', waterType)).toBe(0.5);
      // Water vs Grass = 0.5×
      expect(calculateSingleTypeMultiplier('water', grassType)).toBe(0.5);
      // Grass vs Fire = 0.5×
      expect(calculateSingleTypeMultiplier('grass', fireType)).toBe(0.5);
    });

    it('calculates true immunities (0×)', () => {
      // Ground vs Flying = 0×
      expect(calculateSingleTypeMultiplier('ground', flyingType)).toBe(0);
      // Normal vs Ghost = 0×
      expect(calculateSingleTypeMultiplier('normal', ghostType)).toBe(0);
      // Fighting vs Ghost = 0×
      expect(calculateSingleTypeMultiplier('fighting', ghostType)).toBe(0);
      // Ghost vs Normal = 0×
      expect(calculateSingleTypeMultiplier('ghost', normalType)).toBe(0);
      // Electric vs Ground = 0×
      expect(calculateSingleTypeMultiplier('electric', groundType)).toBe(0);
      // Poison vs Steel = 0×
      expect(calculateSingleTypeMultiplier('poison', steelType)).toBe(0);
    });

    it('calculates normal effectiveness (1×)', () => {
      // Normal vs Water = 1×
      expect(calculateSingleTypeMultiplier('normal', waterType)).toBe(1);
      // Fire vs Normal = 1×
      expect(calculateSingleTypeMultiplier('fire', normalType)).toBe(1);
      // Water vs Electric = 1×
      expect(calculateSingleTypeMultiplier('water', electricType)).toBe(1);
    });
  });

  describe('Dual-Type Defender Calculations', () => {
    it('calculates 4× double weakness when both types are weak', () => {
      // Fire vs Grass / Steel (Grass 2×, Steel 2× -> 4×)
      const fireVsGrassSteel = calculateTypeEffectivenessMultiplier('fire', grassType, steelType);
      expect(fireVsGrassSteel).toBe(4);

      // Ground vs Electric / Steel (Electric 2×, Steel 2× -> 4×)
      const groundVsElectricSteel = calculateTypeEffectivenessMultiplier('ground', electricType, steelType);
      expect(groundVsElectricSteel).toBe(4);
    });

    it('calculates ¼× double resistance when both types resist', () => {
      // Grass vs Fire / Flying (Fire 0.5×, Flying 0.5× -> 0.25×)
      const grassVsFireFlying = calculateTypeEffectivenessMultiplier('grass', fireType, flyingType);
      expect(grassVsFireFlying).toBe(0.25);

      // Fighting vs Flying / Poison (Flying 0.5×, Poison 0.5× -> 0.25×)
      const fightingVsFlyingPoison = calculateTypeEffectivenessMultiplier('fighting', flyingType, poisonType);
      expect(fightingVsFlyingPoison).toBe(0.25);
    });

    it('enforces that immunity strictly yields 0× on dual-type defender even if the other type is weak', () => {
      // Ground vs Electric / Flying:
      // Electric is weak to Ground (2×), but Flying is immune (0×).
      // Combined MUST BE 0×, not 2×!
      const groundVsElectricFlying = calculateTypeEffectivenessMultiplier('ground', electricType, flyingType);
      expect(groundVsElectricFlying).toBe(0);

      // Poison vs Grass / Steel:
      // Grass is weak to Poison (2×), but Steel is immune (0×).
      // Combined MUST BE 0×!
      const poisonVsGrassSteel = calculateTypeEffectivenessMultiplier('poison', grassType, steelType);
      expect(poisonVsGrassSteel).toBe(0);

      // Normal vs Ghost / Steel:
      // Ghost is immune to Normal (0×). Combined MUST BE 0×!
      const normalVsGhostSteel = calculateTypeEffectivenessMultiplier('normal', ghostType, steelType);
      expect(normalVsGhostSteel).toBe(0);
    });

    it('neutralizes weakness (2×) and resistance (0.5×) into normal damage (1×)', () => {
      // Fire vs Grass / Water:
      // Grass is weak to Fire (2×), Water resists Fire (0.5×) -> 2 * 0.5 = 1×
      const fireVsGrassWater = calculateTypeEffectivenessMultiplier('fire', grassType, waterType);
      expect(fireVsGrassWater).toBe(1);

      // Electric vs Water / Grass:
      // Water is weak to Electric (2×), Grass resists Electric (0.5×) -> 2 * 0.5 = 1×
      const electricVsWaterGrass = calculateTypeEffectivenessMultiplier('electric', waterType, grassType);
      expect(electricVsWaterGrass).toBe(1);
    });

    it('guarantees that defender type order does not alter the calculation result', () => {
      const matchups = [
        { attacker: 'fire', d1: grassType, d2: steelType },
        { attacker: 'grass', d1: fireType, d2: flyingType },
        { attacker: 'ground', d1: electricType, d2: flyingType },
        { attacker: 'water', d1: grassType, d2: fireType },
        { attacker: 'electric', d1: waterType, d2: groundType },
      ];

      for (const m of matchups) {
        const orderA = calculateTypeEffectivenessMultiplier(m.attacker, m.d1, m.d2);
        const orderB = calculateTypeEffectivenessMultiplier(m.attacker, m.d2, m.d1);
        expect(orderA).toBe(orderB);
      }
    });

    it('does not count identical defending types twice', () => {
      // Selecting Fire and Fire should yield single-type Fire effectiveness
      const doubleFireWater = calculateTypeEffectivenessMultiplier('water', fireType, fireType);
      const singleFireWater = calculateSingleTypeMultiplier('water', fireType);
      expect(doubleFireWater).toBe(singleFireWater);
      expect(doubleFireWater).toBe(2);

      const doubleFireGrass = calculateTypeEffectivenessMultiplier('grass', fireType, fireType);
      expect(doubleFireGrass).toBe(0.5);
    });

    it('gracefully handles omitted or null second defending type', () => {
      expect(calculateTypeEffectivenessMultiplier('fire', grassType, null)).toBe(2);
      expect(calculateTypeEffectivenessMultiplier('fire', grassType, undefined)).toBe(2);
    });
  });

  describe('Comprehensive Matchup Summary', () => {
    it('summarizes all 18 types for a dual-type defender (Grass / Poison)', () => {
      const summary = calculateMatchupSummary(grassType, poisonType);

      expect(summary.defender1).toBe('grass');
      expect(summary.defender2).toBe('poison');
      expect(summary.matchups).toHaveLength(18);

      // Grass / Poison is weak to Fire, Ice, Flying, Psychic (each 2×)
      const weaknessTypes = summary.weaknesses.map((w) => w.attackingType);
      expect(weaknessTypes).toContain('fire');
      expect(weaknessTypes).toContain('ice');
      expect(weaknessTypes).toContain('flying');
      expect(weaknessTypes).toContain('psychic');

      // Grass / Poison resists Grass (0.25×), Electric (0.5×), Water (0.5×), Fighting (0.5×), Fairy (0.5×)
      const resistanceTypes = summary.resistances.map((r) => r.attackingType);
      expect(resistanceTypes).toContain('grass');
      expect(resistanceTypes).toContain('water');
      expect(resistanceTypes).toContain('electric');

      // Grass is double-resisted: 0.5 * 0.5 = 0.25×
      const grassMatchup = summary.resistances.find((r) => r.attackingType === 'grass');
      expect(grassMatchup?.multiplier).toBe(0.25);
      expect(grassMatchup?.formattedMultiplier).toBe('¼×');

      // Total count across categories must match total evaluated types
      const totalCategorized =
        summary.weaknesses.length +
        summary.resistances.length +
        summary.immunities.length +
        summary.normalDamage.length;
      expect(totalCategorized).toBe(18);
    });

    it('sorts weaknesses with 4× preceding 2× and resistances with ¼× preceding ½×', () => {
      const summary = calculateMatchupSummary(grassType, steelType);

      // Grass / Steel is 4× weak to Fire! Fire must be the first weakness.
      expect(summary.weaknesses.length).toBeGreaterThan(0);
      expect(summary.weaknesses[0].attackingType).toBe('fire');
      expect(summary.weaknesses[0].multiplier).toBe(4);

      // Poison is immune (0×) due to Steel
      expect(summary.immunities.map((i) => i.attackingType)).toContain('poison');
    });

    it('produces identical matchup lists regardless of defending type order', () => {
      const summaryA = calculateMatchupSummary(fireType, flyingType);
      const summaryB = calculateMatchupSummary(flyingType, fireType);

      expect(summaryA.weaknesses.length).toBe(summaryB.weaknesses.length);
      expect(summaryA.resistances.length).toBe(summaryB.resistances.length);
      expect(summaryA.immunities.length).toBe(summaryB.immunities.length);
      expect(summaryA.normalDamage.length).toBe(summaryB.normalDamage.length);

      for (const itemA of summaryA.matchups) {
        const itemB = summaryB.matchups.find((m) => m.attackingType === itemA.attackingType);
        expect(itemB).toBeDefined();
        expect(itemB?.multiplier).toBe(itemA.multiplier);
      }
    });
  });

  describe('Validation & Error Handling', () => {
    it('throws VALIDATION_ERROR on empty or invalid attacking type', () => {
      expect(() => calculateSingleTypeMultiplier('', grassType)).toThrow();
      expect(() => calculateSingleTypeMultiplier('   ', grassType)).toThrow();

      try {
        calculateSingleTypeMultiplier('', grassType);
      } catch (err) {
        expect(isPokeApiError(err)).toBe(true);
        if (isPokeApiError(err)) {
          expect(err.code).toBe('VALIDATION_ERROR');
        }
      }
    });

    it('throws VALIDATION_ERROR on null or malformed type data', () => {
      expect(() => calculateSingleTypeMultiplier('fire', null as unknown as PokeApiType)).toThrow();
      expect(() => calculateSingleTypeMultiplier('fire', {} as unknown as PokeApiType)).toThrow();

      try {
        calculateSingleTypeMultiplier('fire', null as unknown as PokeApiType);
      } catch (err) {
        expect(isPokeApiError(err)).toBe(true);
        if (isPokeApiError(err)) {
          expect(err.code).toBe('VALIDATION_ERROR');
        }
      }
    });

    it('throws VALIDATION_ERROR when primary defender is missing in summary calculation', () => {
      expect(() => calculateMatchupSummary(null as unknown as PokeApiType)).toThrow();
    });
  });
});
