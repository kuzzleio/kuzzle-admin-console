export const selectedDocuments = state => {
  return state.crudlDocument.selectedDocuments
}

/**
 * @param state
 * @returns return the basic filter which is in form basic filter -> the real data from form (and not from url)
 */
export const basicFilterForm = state => {
  return state.crudlDocument.basicFilter
}
