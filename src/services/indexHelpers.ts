import { Index } from '@/vuex/modules/index/types' ;

export const filterIndexesByKeyword = (indexes: Index[], word: string) => {
  if (!word || word === '') {
    return indexes ;
  }

  let lowerCaseWord = word.toLowerCase()

  return indexes.filter(element => {
    if (element.name.toLowerCase().indexOf(lowerCaseWord) >= 0) {
      return true ;
    }

    if (
      element.collections &&
      element.collections.some(
        collection => collection.name.toLowerCase().indexOf(lowerCaseWord) >= 0
      )
    ) {
      return true ;
    }
  }) ;
} ;

export const getIndexPosition = (
  indexes: Index[],
  indexName: string
): number => {
  return indexes.findIndex(el => el.name === indexName)
} ;
