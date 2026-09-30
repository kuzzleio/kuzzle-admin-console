/* Un rôle tel que le rend `performSearchRoles` : le rôle du SDK, sans `_kuzzle`. */
export interface RoleDocument {
  [key: string]: unknown;
  _id: string;
}

/* Le filtre de la liste : les contrôleurs cherchés. */
export interface RoleFilter {
  controllers?: string[];
}
