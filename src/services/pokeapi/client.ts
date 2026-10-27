import { PokeApiErrorCode, PokeApiErrorOptions } from '@/types/pokeapi';

export const POKEAPI_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_POKEAPI_BASE_URL) ||
  'https://pokeapi.co/api/v2';

/**
 * Structured error class for PokéAPI client operations.
 * Distinguishes HTTP status failures, network drops, malformed JSON,
 * aborted requests, and client parameter validation issues.
 */
export class PokeApiError extends Error {
  readonly code: PokeApiErrorCode;
  readonly status?: number;
  readonly statusText?: string;
  readonly url?: string;
  readonly userMessage: string;

  constructor(options: PokeApiErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = 'PokeApiError';
    this.code = options.code;
    this.status = options.status;
    this.statusText = options.statusText;
    this.url = options.url;
    this.userMessage = options.userMessage || getDefaultUserMessage(options.code, options.status);
  }
}

/**
 * Map error conditions to safe, human-readable user messages.
 */
function getDefaultUserMessage(code: PokeApiErrorCode, status?: number): string {
  if (code === 'ABORT_ERROR') {
    return 'The request was cancelled.';
  }
  if (code === 'VALIDATION_ERROR') {
    return 'Invalid request parameter.';
  }
  if (code === 'PARSE_ERROR') {
    return 'Unable to process the response from the Pokémon service.';
  }
  if (code === 'NETWORK_ERROR') {
    return 'Unable to connect to the Pokémon service. Please check your network connection.';
  }
  if (status === 404) {
    return 'The requested Pokémon or resource could not be found.';
  }
  if (status === 429) {
    return 'Service request limit reached. Please wait a moment before trying again.';
  }
  if (status && status >= 500) {
    return 'The Pokémon service is temporarily unavailable. Please try again later.';
  }
  return 'An error occurred while loading Pokémon data. Please try again.';
}

/**
 * Type guard for PokeApiError.
 */
export function isPokeApiError(error: unknown): error is PokeApiError {
  return error instanceof PokeApiError;
}

/**
 * Returns true if the error represents a 404 Not Found response.
 */
export function isNotFoundError(error: unknown): boolean {
  return isPokeApiError(error) && error.status === 404;
}

/**
 * Returns true if the error represents a user or system aborted request.
 */
export function isAbortError(error: unknown): boolean {
  if (isPokeApiError(error)) {
    return error.code === 'ABORT_ERROR';
  }
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name: string }).name === 'AbortError'
  );
}

/**
 * Returns true if the error was caused by a network connection failure.
 */
export function isNetworkError(error: unknown): boolean {
  return isPokeApiError(error) && error.code === 'NETWORK_ERROR';
}

export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export interface PokeApiClientConfig {
  baseUrl?: string;
  fetchFn?: typeof fetch;
}

/**
 * Centralized, lightweight HTTP client for PokéAPI v2.
 */
export class PokeApiClient {
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;

  constructor(config: PokeApiClientConfig = {}) {
    this.baseUrl = (config.baseUrl || POKEAPI_BASE_URL).replace(/\/+$/, '');
    this.fetchFn = config.fetchFn || globalThis.fetch.bind(globalThis);
  }

  /**
   * Safely construct an absolute URL with query parameters.
   */
  public buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    let url: URL;
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      url = new URL(endpoint);
    } else {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      url = new URL(`${this.baseUrl}${cleanEndpoint}`);
    }

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  /**
   * Perform an HTTP GET request to PokéAPI and return parsed JSON.
   */
  public async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const fullUrl = this.buildUrl(endpoint, options.params);

    if (options.signal?.aborted) {
      throw new PokeApiError({
        message: 'Request was aborted before execution',
        code: 'ABORT_ERROR',
        url: fullUrl,
      });
    }

    let response: Response;
    try {
      response = await this.fetchFn(fullUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...options.headers,
        },
        signal: options.signal,
      });
    } catch (err: unknown) {
      if (isAbortError(err)) {
        throw new PokeApiError({
          message: 'Request aborted by caller',
          code: 'ABORT_ERROR',
          url: fullUrl,
          cause: err,
        });
      }

      throw new PokeApiError({
        message: err instanceof Error ? err.message : 'Network request failed',
        code: 'NETWORK_ERROR',
        url: fullUrl,
        cause: err,
      });
    }

    if (!response.ok) {
      let errorBodyText = '';
      try {
        errorBodyText = await response.text();
      } catch {
        // Ignore read failures on error response body
      }

      throw new PokeApiError({
        message: `HTTP error ${response.status} (${response.statusText}): ${errorBodyText || 'No detail'}`,
        code: 'HTTP_ERROR',
        status: response.status,
        statusText: response.statusText,
        url: fullUrl,
      });
    }

    try {
      const data = (await response.json()) as T;
      return data;
    } catch (parseErr: unknown) {
      throw new PokeApiError({
        message: 'Failed to parse JSON response from PokéAPI',
        code: 'PARSE_ERROR',
        status: response.status,
        statusText: response.statusText,
        url: fullUrl,
        cause: parseErr,
      });
    }
  }
}

/**
 * Singleton instance of PokeApiClient.
 */
export const pokeApiClient = new PokeApiClient();
