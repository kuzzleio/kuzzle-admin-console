/* Une condition du filtre avancé : un attribut, un opérateur, une valeur. */
export interface BasicFilterStatement {
  attribute: string | null;
  operator: string;
  value: string | number | null;
  gt_value?: string | number;
  lt_value?: string | number;
}

/* Des groupes reliés par OR, chacun fait de conditions reliées par AND. */
export type BasicFilterGroups = BasicFilterStatement[][];

export interface FilterSorting {
  attribute: string | null;
  order: string;
}

/*
 * Le filtre de `filterManager`, pour ce que les filtres en lisent. `from` et
 * `size` peuvent venir de la query de l'URL, donc être des chaînes.
 */
export interface SearchFilter {
  active: string | null;
  quick?: string;
  basic?: BasicFilterGroups | null;
  raw?: Record<string, unknown> | null;
  sorting?: FilterSorting | null;
  from?: unknown;
  size?: unknown;
}

/* Un filtre de l'historique ou des favoris : `addNewHistoryItemAndSave` le nomme et le date. */
export interface SavedFilter extends SearchFilter {
  id: number;
  name: string;
}
