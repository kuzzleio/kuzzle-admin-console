import type { EnvironmentColor } from '@/stores/types/kuzzle';

export const antiGlitchOverlayTimeout = 900;

export const LS_ENVIRONMENTS = 'environments';
export const LS_LAST_ENV = 'lastEnv';
export const SS_CURRENT_ENV = 'currentEnv';
// Ancienne clé du `sessionId` OpenID, commune à tous les environnements :
// supprimée au chargement, sans reprise (ADR-0064).
export const LS_LEGACY_OPENID_SESSION_ID = 'openid-sessionId';
// Les champs de session d'un environnement : ni exportés, ni importés.
export const ENVIRONMENT_SESSION_FIELDS = ['token', 'openidSessionId'] as const;

export const NO_ADMIN_WARNING_HOSTS = ['localhost', '127.0.0.1'];

export const DEFAULT_COLOR: EnvironmentColor = 'darkblue';
export const ENV_COLORS: EnvironmentColor[] = [
  DEFAULT_COLOR,
  'lightblue',
  'purple',
  'green',
  'orange',
  'red',
  'grey',
  'magenta',
];

export const formatForDom = (word: string): string => {
  return word.replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~ ]/g, '-');
};

export const sortObject = <V>(object: Record<string, V>): Record<string, V> => {
  return Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)));
};

export const truncateName = (name: string, maxLength = 50): string => {
  if (name.length === 0) {
    return '';
  } else if (name.length <= maxLength) {
    return name;
  }

  return `${name.substring(0, maxLength)}...`;
};

export const dateFromTimestamp = (value: unknown): Date | null => {
  let timestamp: number;

  if (typeof value === 'string') {
    if (!isNaN(Date.parse(value))) {
      timestamp = Date.parse(value);
    } else {
      timestamp = parseInt(value, 10);
    }

    if (isNaN(timestamp)) {
      return null;
    }
  } else if (typeof value === 'number' && Number.isInteger(value)) {
    timestamp = value;
  } else {
    return null;
  }

  const length = `${timestamp}`.length;

  let date: Date;
  if (length === 10) {
    date = new Date(timestamp * 1000);
  } else if (length === 13) {
    date = new Date(timestamp);
  } else {
    return null;
  }

  return date;
};

/*
 * Valeur en pixels d'un token de `tokens.css` (`--sidebar-width`…), pour les
 * API qui prennent un nombre et non une classe — `default-size` de `reka-ui`.
 */
export const cssPixels = (token: string): number =>
  Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(token)) || 0;
