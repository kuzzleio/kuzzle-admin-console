import { Index } from '@/vuex/modules/index/types'

export const filterIndexesByKeyword = (indexTree, word) => {
  const indexes = Object.keys(indexTree)
  if (!word || word === '') {
    return indexes
  }

  let lowerCaseWord = word.toLowerCase()

  return indexes.filter(element => {
    if (element.toLowerCase().indexOf(lowerCaseWord) >= 0) {
      return true
    }

    let collections = indexTree[element]

    if (
      collections.stored &&
      collections.stored.some(
        collection => collection.toLowerCase().indexOf(lowerCaseWord) >= 0
      )
    ) {
      return true
    }

    if (
      collections.realtime &&
      collections.realtime.some(
        collection => collection.toLowerCase().indexOf(lowerCaseWord) >= 0
      )
    ) {
      return true
    }
  })
}

export const getIndexPosition = (indexes :Index[], indexName :string) :number => {
  return indexes.findIndex(el => el.name === indexName)
}
