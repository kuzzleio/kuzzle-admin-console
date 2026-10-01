export const LOCALSTORAGE_PREFIX = 'kuz-ac-settings';
export const LIST_VIEW_LIST = 'list';
export const LIST_VIEW_BOXES = 'boxes';
export const LIST_VIEW_MAP = 'map';
export const LIST_VIEW_COLUMN = 'column';
export const LIST_VIEW_TIME_SERIES = 'time-series';

/*
 * Les valeurs réelles : des chaînes, lues et écrites telles quelles dans le
 * `localStorage` et la query. L'ancien `enum` numérique ne typait rien de vrai.
 */
export type ListViewType =
  | typeof LIST_VIEW_LIST
  | typeof LIST_VIEW_MAP
  | typeof LIST_VIEW_TIME_SERIES
  | typeof LIST_VIEW_COLUMN;

export interface CollectionSettings {
  listViewType?: ListViewType;
  autoSync?: boolean;
  columnView?: {
    fields: string[];
  };
}

export function loadSettingsForCollection(index: string, collection: string): CollectionSettings {
  const settings = localStorage.getItem(`${LOCALSTORAGE_PREFIX}:${index}/${collection}`);
  if (settings === null) {
    return {};
  }
  return JSON.parse(settings);
}

export function saveSettingsForCollection(
  index: string,
  collection: string,
  settings: CollectionSettings,
) {
  localStorage.setItem(`${LOCALSTORAGE_PREFIX}:${index}/${collection}`, JSON.stringify(settings));
}
