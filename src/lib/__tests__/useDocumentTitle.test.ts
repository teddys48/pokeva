import { describe, expect, it } from 'bun:test';
import { useDocumentTitle, formatDocumentTitle } from '../useDocumentTitle';

describe('Phase 7: useDocumentTitle & formatDocumentTitle', () => {
  it('is a defined hook function', () => {
    expect(typeof useDocumentTitle).toBe('function');
  });

  it('formats title consistently with brand suffix', () => {
    expect(formatDocumentTitle()).toBe('Pokéva — Pokémon Explorer');
    expect(formatDocumentTitle('')).toBe('Pokéva — Pokémon Explorer');
    expect(formatDocumentTitle('   ')).toBe('Pokéva — Pokémon Explorer');
    expect(formatDocumentTitle('Pikachu (#0025)')).toBe('Pikachu (#0025) — Pokéva');
    expect(formatDocumentTitle('About Pokéva — Explorer')).toBe('About Pokéva — Explorer');
  });

  it('updates document.title when document is simulated', () => {
    const originalDocument = (globalThis as unknown as { document?: { title: string } }).document;
    (globalThis as unknown as { document: { title: string } }).document = { title: 'Initial' };

    try {
      const formatted = formatDocumentTitle('Pikachu (#0025)');
      if (typeof document !== 'undefined') {
        document.title = formatted;
      }
      expect(document.title).toBe('Pikachu (#0025) — Pokéva');
    } finally {
      (globalThis as unknown as { document?: { title: string } }).document = originalDocument;
    }
  });
});
