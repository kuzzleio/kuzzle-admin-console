/*
 * Dates de la console, sans `moment` (ADR-0052). Tout est en heure locale :
 * des formats fixes et une lecture de valeur Elasticsearch. `Date` et `Intl`
 * suffisent, sans bibliothèque ni table de locales.
 */

const pad = (value: number): string => String(value).padStart(2, '0');

/**
 * `16/05/2023, 02:00:00 GMT+2` — une valeur datée d'un document, en heure
 * locale suivie de son décalage : sans lui, deux personnes dans deux fuseaux
 * lisaient deux heures différentes pour la même valeur, sans le savoir
 * (ADR-0062, #1001).
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-GB', { timeZoneName: 'shortOffset' });
}

/**
 * `H:mm:ss` — heure d'une notification temps réel, sans zéro devant l'heure.
 * Sans horodatage, l'heure courante : c'est ce que rendait `moment(undefined)`.
 */
export function formatClockTime(value?: Date | number | string): string {
  const date = value === undefined ? new Date() : new Date(value);

  return `${date.getHours()}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * `YY/MM/DD k:mm` — nom d'une entrée d'historique des filtres. `k` est l'heure
 * de 1 à 24 : minuit s'écrit `24`, comme le faisait `moment`.
 */
export function formatHistoryName(date: Date): string {
  const year = pad(date.getFullYear() % 100);
  const hours = date.getHours() === 0 ? 24 : date.getHours();

  return `${year}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${hours}:${pad(date.getMinutes())}`;
}

/** `YYYY-MM-DD`, la valeur d'un `<input type="date">`. */
export function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** `HH:mm:ss`, la valeur d'un `<input type="time" step="1">`. */
export function toTimeInputValue(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Horodatage en millisecondes, en chaîne, d'une date et d'une heure saisies
 * dans deux champs natifs. Une heure absente vaut minuit : `moment` rendait
 * alors `"Invalid date"`, qu'Elasticsearch refusait.
 */
export function fromDateTimeInputs(date: string, time: string | null): string {
  return String(new Date(`${date}T${time || '00:00:00'}`).getTime());
}
