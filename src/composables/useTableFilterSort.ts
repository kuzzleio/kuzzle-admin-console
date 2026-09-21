import { computed, type ComputedRef, type Ref, ref } from 'vue';

/*
 * useTableFilterSort — le filtre et le tri des listes, écrits une fois
 * (ADR-0011, décision 3).
 *
 * Ce n'est pas du design system : ça n'a pas de rendu. `Table` est du balisage,
 * et les deux écrans qui listent (Indexes, CollectionList) gardent leur `v-for`
 * explicite ; seule la logique commune est ici.
 *
 * Deux écarts assumés avec `b-table`, tous deux des corrections :
 *
 * - **Le filtre porte sur des champs nommés.** `b-table` sérialisait la ligne
 *   entière, champs non affichés compris : taper `stored` dans la liste des
 *   collections les remontait toutes, parce que `type` fait partie de l'objet.
 * - **La colonne triée est nommée par une fonction, pas par une clé.** Sur la
 *   page Indexes, les deux colonnes déclarées `sortable` pointaient des clés
 *   (`indexName`, `collectionCount`) qu'aucun index ne porte : le tri ne
 *   faisait rien depuis des années, sans que rien ne le signale (G-022).
 */

export type SortDirection = 'asc' | 'desc';

/** Valeur comparable extraite d'une ligne. `undefined` = la ligne ne l'a pas. */
export type SortValue = string | number | undefined | null;

export interface TableFilterSortOptions<T> {
  /** Champs sur lesquels la saisie du filtre est comparée. */
  filterOn: (item: T) => SortValue[];
  /** Valeur de tri par colonne, indexée par la clé passée à `toggleSort`. */
  sorters: Record<string, (item: T) => SortValue>;
}

export interface TableFilterSort<T> {
  /** Saisie du filtre, à brancher sur un `v-model`. */
  filter: Ref<string>;
  /** Colonne triée, ou `null` tant qu'aucun en-tête n'a été cliqué. */
  sortKey: Ref<string | null>;
  sortDirection: Ref<SortDirection>;
  /** Les lignes à afficher : filtrées, puis triées. */
  rows: ComputedRef<T[]>;
  /** Vrai dès que le filtre est saisi — distingue « vide » de « vide filtré ». */
  filtering: ComputedRef<boolean>;
  toggleSort: (key: string) => void;
  /** Valeur de l'attribut `aria-sort` de l'en-tête d'une colonne. */
  ariaSort: (key: string) => 'ascending' | 'descending' | 'none';
}

function isEmpty(value: SortValue): boolean {
  return value === undefined || value === null || value === '';
}

/**
 * Compare deux valeurs de tri.
 *
 * Les valeurs absentes vont toujours en fin de liste, dans les deux sens : sur
 * la page Indexes, la colonne « Collections » affiche `--` tant que les
 * collections d'un index n'ont pas été chargées, et remonter ces lignes-là en
 * tête au premier clic ne dirait rien à personne.
 */
function compareValues(a: SortValue, b: SortValue, direction: SortDirection): number {
  if (isEmpty(a) || isEmpty(b)) {
    if (isEmpty(a) && isEmpty(b)) {
      return 0;
    }
    return isEmpty(a) ? 1 : -1;
  }

  const factor = direction === 'asc' ? 1 : -1;

  if (typeof a === 'number' && typeof b === 'number') {
    return (a - b) * factor;
  }

  return (
    String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }) * factor
  );
}

export function useTableFilterSort<T>(
  source: () => T[],
  options: TableFilterSortOptions<T>,
): TableFilterSort<T> {
  const filter = ref('');
  const sortKey = ref<string | null>(null);
  const sortDirection = ref<SortDirection>('asc');

  const needle = computed(() => filter.value.trim().toLowerCase());
  const filtering = computed(() => needle.value !== '');

  const filtered = computed(() => {
    const items = source() ?? [];

    if (!filtering.value) {
      return items;
    }

    return items.filter((item) =>
      options
        .filterOn(item)
        .some((value) => !isEmpty(value) && String(value).toLowerCase().includes(needle.value)),
    );
  });

  const rows = computed(() => {
    const key = sortKey.value;

    if (key === null) {
      return filtered.value;
    }

    const sorter = options.sorters[key];

    if (sorter === undefined) {
      return filtered.value;
    }

    // `sort` trie en place : la copie évite de réordonner le tableau du store.
    return [...filtered.value].sort((a, b) =>
      compareValues(sorter(a), sorter(b), sortDirection.value),
    );
  });

  function toggleSort(key: string): void {
    if (sortKey.value === key) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      return;
    }

    sortKey.value = key;
    sortDirection.value = 'asc';
  }

  function ariaSort(key: string): 'ascending' | 'descending' | 'none' {
    if (sortKey.value !== key) {
      return 'none';
    }

    return sortDirection.value === 'asc' ? 'ascending' : 'descending';
  }

  return { filter, sortKey, sortDirection, rows, filtering, toggleSort, ariaSort };
}
