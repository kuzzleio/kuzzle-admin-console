import type { Kuzzle } from 'kuzzle-sdk-v7';

/*
 * Clés d'API (ADR-0070).
 *
 * Deux portées, une seule forme : les clés d'un utilisateur, par le
 * contrôleur `security`, qui prend son `userId`, et celles de l'utilisateur
 * connecté, par `auth`. Les appels passent par `query` : les deux contrôleurs
 * du SDK n'ont pas la même signature, la requête brute si.
 *
 * Le jeton n'est renvoyé qu'à la création. `createApiKey` le rend à part de
 * la clé, pour qu'il ne suive pas la clé dans une liste ou un store.
 */

export type ApiKeyScope = { controller: 'auth' } | { controller: 'security'; userId: string };

export interface ApiKey {
  description: string;
  /** Horodatage en millisecondes, `-1` pour une clé sans expiration. */
  expiresAt: number;
  /** SHA-256 du jeton : ce qui relie un jeton à sa clé. */
  fingerprint: string;
  id: string;
  userId: string;
}

export interface ApiKeySearchResult {
  hits: ApiKey[];
  total: number;
}

/** Les durées proposées à la création, la plus courte d'abord. */
export const EXPIRATIONS = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: '1 year', value: '365d' },
  { label: 'No expiration', value: '-1' },
] as const;

export type Expiration = (typeof EXPIRATIONS)[number]['value'];

/** Le choix prudent : une clé créée vite et oubliée finit par s'expirer. */
export const DEFAULT_EXPIRATION: Expiration = '90d';

/**
 * Une recherche ramène au plus ce nombre de clés. La liste se filtre côté
 * console : un utilisateur n'en a jamais autant, et la page le dit sinon.
 */
export const SEARCH_SIZE = 1000;

function scopeArgs(scope: ApiKeyScope): Record<string, string> {
  return scope.controller === 'security' ? { userId: scope.userId } : {};
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function toApiKey(hit: unknown): ApiKey {
  const { _id, _source } = asRecord(hit);
  const source = asRecord(_source);

  return {
    description: typeof source.description === 'string' ? source.description : '',
    expiresAt: typeof source.expiresAt === 'number' ? source.expiresAt : -1,
    fingerprint: typeof source.fingerprint === 'string' ? source.fingerprint : '',
    id: String(_id),
    userId: typeof source.userId === 'string' ? source.userId : '',
  };
}

export async function searchApiKeys(sdk: Kuzzle, scope: ApiKeyScope): Promise<ApiKeySearchResult> {
  const { result } = await sdk.query({
    ...scopeArgs(scope),
    action: 'searchApiKeys',
    body: {},
    controller: scope.controller,
    size: SEARCH_SIZE,
  });
  const { hits, total } = asRecord(result);
  const keys = Array.isArray(hits) ? hits.map(toApiKey) : [];

  return { hits: keys, total: typeof total === 'number' ? total : keys.length };
}

export async function createApiKey(
  sdk: Kuzzle,
  scope: ApiKeyScope,
  description: string,
  expiresIn: Expiration,
): Promise<{ key: ApiKey; token: string }> {
  const { result } = await sdk.query({
    ...scopeArgs(scope),
    action: 'createApiKey',
    body: { description },
    controller: scope.controller,
    expiresIn: expiresIn === '-1' ? -1 : expiresIn,
    refresh: 'wait_for',
  });
  const token = asRecord(asRecord(result)._source).token;

  if (typeof token !== 'string') {
    throw new Error('Kuzzle did not return the token of the new API key');
  }

  return { key: toApiKey(result), token };
}

export async function deleteApiKey(sdk: Kuzzle, scope: ApiKeyScope, id: string): Promise<void> {
  await sdk.query({
    ...scopeArgs(scope),
    _id: id,
    action: 'deleteApiKey',
    controller: scope.controller,
    refresh: 'wait_for',
  });
}

export function isExpired(key: ApiKey, now: number = Date.now()): boolean {
  return key.expiresAt !== -1 && key.expiresAt <= now;
}

const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600 * 1000],
  ['month', 30 * 24 * 3600 * 1000],
  ['day', 24 * 3600 * 1000],
  ['hour', 3600 * 1000],
  ['minute', 60 * 1000],
];

/** `in 3 months`, `2 days ago` : l'échéance lue d'un coup d'œil. */
export function formatRelative(timestamp: number, now: number = Date.now()): string {
  const delta = timestamp - now;

  for (const [unit, size] of UNITS) {
    if (Math.abs(delta) >= size) {
      return relativeTime.format(Math.round(delta / size), unit);
    }
  }

  return relativeTime.format(Math.round(delta / 1000), 'second');
}
