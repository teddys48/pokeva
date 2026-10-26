import { describe, expect, it } from 'bun:test';
import {
  isAbortError,
  isNetworkError,
  isNotFoundError,
  isPokeApiError,
  PokeApiClient,
  PokeApiError,
  POKEAPI_BASE_URL,
} from '../client';

describe('PokeApiClient & Error Handling', () => {
  it('builds standard PokéAPI URLs with query parameters', () => {
    const client = new PokeApiClient();
    const url = client.buildUrl('/pokemon', { limit: 20, offset: 40 });
    expect(url).toBe(`${POKEAPI_BASE_URL}/pokemon?limit=20&offset=40`);
  });

  it('builds URLs correctly without leading slash', () => {
    const client = new PokeApiClient();
    const url = client.buildUrl('type/13');
    expect(url).toBe(`${POKEAPI_BASE_URL}/type/13`);
  });

  it('omits undefined or null query parameters', () => {
    const client = new PokeApiClient();
    const url = client.buildUrl('/pokemon', { limit: 10, offset: undefined });
    expect(url).toBe(`${POKEAPI_BASE_URL}/pokemon?limit=10`);
  });

  it('successfully parses 200 OK JSON responses', async () => {
    const mockData = { id: 25, name: 'pikachu' };
    const mockFetch = async () =>
      new Response(JSON.stringify(mockData), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      });

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });
    const result = await client.get<typeof mockData>('/pokemon/25');
    expect(result).toEqual(mockData);
  });

  it('handles 404 Not Found HTTP errors with structured PokeApiError', async () => {
    const mockFetch = async () =>
      new Response('Not Found', {
        status: 404,
        statusText: 'Not Found',
      });

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });

    try {
      await client.get('/pokemon/non-existent-pokemon');
      expect().fail('Expected call to throw PokeApiError');
    } catch (err: unknown) {
      expect(isPokeApiError(err)).toBe(true);
      expect(isNotFoundError(err)).toBe(true);
      if (isPokeApiError(err)) {
        expect(err.code).toBe('HTTP_ERROR');
        expect(err.status).toBe(404);
        expect(err.userMessage).toBe('The requested Pokémon or resource could not be found.');
      }
    }
  });

  it('handles 429 Rate Limit HTTP errors with user-friendly message', async () => {
    const mockFetch = async () =>
      new Response('Rate limit exceeded', {
        status: 429,
        statusText: 'Too Many Requests',
      });

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });

    try {
      await client.get('/pokemon');
      expect().fail('Expected call to throw PokeApiError');
    } catch (err: unknown) {
      expect(isPokeApiError(err)).toBe(true);
      if (isPokeApiError(err)) {
        expect(err.status).toBe(429);
        expect(err.userMessage).toContain('request limit reached');
      }
    }
  });

  it('handles 500 Internal Server Error HTTP errors', async () => {
    const mockFetch = async () =>
      new Response('Internal Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });

    try {
      await client.get('/pokemon');
      expect().fail('Expected call to throw PokeApiError');
    } catch (err: unknown) {
      expect(isPokeApiError(err)).toBe(true);
      if (isPokeApiError(err)) {
        expect(err.code).toBe('HTTP_ERROR');
        expect(err.status).toBe(500);
        expect(err.userMessage).toContain('temporarily unavailable');
      }
    }
  });

  it('handles network drops and fetch rejections as NETWORK_ERROR', async () => {
    const mockFetch = async () => {
      throw new TypeError('Failed to fetch');
    };

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });

    try {
      await client.get('/pokemon/1');
      expect().fail('Expected call to throw NETWORK_ERROR');
    } catch (err: unknown) {
      expect(isPokeApiError(err)).toBe(true);
      expect(isNetworkError(err)).toBe(true);
      if (isPokeApiError(err)) {
        expect(err.code).toBe('NETWORK_ERROR');
        expect(err.userMessage).toContain('network connection');
      }
    }
  });

  it('handles malformed JSON responses as PARSE_ERROR', async () => {
    const mockFetch = async () =>
      new Response('Invalid { JSON content', {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      });

    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });

    try {
      await client.get('/pokemon/1');
      expect().fail('Expected call to throw PARSE_ERROR');
    } catch (err: unknown) {
      expect(isPokeApiError(err)).toBe(true);
      if (isPokeApiError(err)) {
        expect(err.code).toBe('PARSE_ERROR');
        expect(err.userMessage).toContain('Unable to process the response');
      }
    }
  });

  it('handles pre-aborted signals as ABORT_ERROR', async () => {
    const controller = new AbortController();
    controller.abort();

    const client = new PokeApiClient();
    try {
      await client.get('/pokemon/1', { signal: controller.signal });
      expect().fail('Expected call to throw ABORT_ERROR');
    } catch (err: unknown) {
      expect(isPokeApiError(err)).toBe(true);
      expect(isAbortError(err)).toBe(true);
      if (isPokeApiError(err)) {
        expect(err.code).toBe('ABORT_ERROR');
        expect(err.userMessage).toBe('The request was cancelled.');
      }
    }
  });

  it('handles signals aborted mid-request as ABORT_ERROR', async () => {
    const mockFetch = async (_url: string, init?: RequestInit) => {
      if (init?.signal) {
        const error = new Error('The user aborted a request.');
        error.name = 'AbortError';
        throw error;
      }
      return new Response('{}');
    };

    const controller = new AbortController();
    const client = new PokeApiClient({ fetchFn: mockFetch as unknown as typeof fetch });

    try {
      await client.get('/pokemon/1', { signal: controller.signal });
      expect().fail('Expected call to throw ABORT_ERROR');
    } catch (err: unknown) {
      expect(isPokeApiError(err)).toBe(true);
      expect(isAbortError(err)).toBe(true);
    }
  });

  it('correctly sets custom error properties', () => {
    const error = new PokeApiError({
      message: 'Custom message',
      code: 'VALIDATION_ERROR',
      userMessage: 'Custom user message',
    });

    expect(error.name).toBe('PokeApiError');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Custom message');
    expect(error.userMessage).toBe('Custom user message');
  });
});
