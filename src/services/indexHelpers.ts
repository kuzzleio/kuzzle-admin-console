import type { Index } from '@/vuex/modules/index/types';

export const filterIndexesByKeyword = (indexes: Index[], word: string) => {
  if (!word || word === '') {
    return indexes;
  }

  const lowerCaseWord = word.toLowerCase();

  return indexes.filter((element) => {
    if (element.name.toLowerCase().includes(lowerCaseWord)) {
      return true;
    }

    if (
      element.collections != null &&
      element.collections.some((collection) =>
        collection.name.toLowerCase().includes(lowerCaseWord),
      )
    ) {
      return true;
    }
  });
};

export const getIndexPosition = (indexes: Index[], indexName: string): number => {
  return indexes.findIndex((el) => el.name === indexName);
};
