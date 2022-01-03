export const LOCALSTORAGE_PREFIX = 'kuz-ac-settings'
export const LIST_VIEW_LIST: string = 'list'
export const LIST_VIEW_BOXES: string = 'boxes'
export const LIST_VIEW_MAP: string = 'map'
export const LIST_VIEW_COLUMN: string = 'column'
export const LIST_VIEW_TIME_SERIES: string = 'time-series'

enum ListViewType {
  LIST_VIEW_LIST,
  LIST_VIEW_MAP,
  LIST_VIEW_TIME_SERIES,
  LIST_VIEW_COLUMN
}

export type CollectionSettings = {
  listViewType?: ListViewType
  autoSync?: boolean
  columnView?: {
    fields: string[]
  }
}

export function loadSettingsForCollection(
  index: string,
  collection: string
): CollectionSettings {
  const settings = localStorage.getItem(
    `${LOCALSTORAGE_PREFIX}:${index}/${collection}`
  )
  if (settings === null) {
    return {}
  }
  return JSON.parse(settings)
}

export function saveSettingsForCollection(
  index: string,
  collection: string,
  settings: CollectionSettings
) {
  localStorage.setItem(
    `${LOCALSTORAGE_PREFIX}:${index}/${collection}`,
    JSON.stringify(settings)
  )
}
