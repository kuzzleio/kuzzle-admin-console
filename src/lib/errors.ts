/*
 * Les champs d'une erreur rattrapée, lus sans la supposer.
 *
 * Un `catch` reçoit un `unknown` : une `KuzzleError` du SDK v7, son
 * équivalent du SDK v6, une `Error` du navigateur, ou n'importe quoi d'autre.
 * Le code en Options API lisait `err.id` et `err.message` sans vérifier ;
 * en TypeScript, les lire passe par ici plutôt que par un `as` à chaque site
 * (ADR-0060). Un champ absent ou d'un autre type vaut `undefined`.
 */
export interface CaughtError {
  code?: number;
  id?: string;
  message: string;
  status?: number;
  /** Tout autre champ, à vérifier au site d'appel. */
  field: (name: string) => unknown;
}

function read(error: unknown, name: string): unknown {
  return typeof error === 'object' && error !== null ? Reflect.get(error, name) : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export function caught(error: unknown): CaughtError {
  return {
    code: asNumber(read(error, 'code')),
    field: (name) => read(error, name),
    id: asString(read(error, 'id')),
    message: asString(read(error, 'message')) ?? String(error),
    status: asNumber(read(error, 'status')),
  };
}
