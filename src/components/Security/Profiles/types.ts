/* Un profil tel que le rend `performSearchProfiles` : le profil du SDK, sans `_kuzzle`. */
export interface ProfileDocument {
  [key: string]: unknown;
  _id: string;
  additionalAttribute?: { name: string; value: unknown };
}

/* Ce que le formulaire soumet : le JSON saisi, et l'identifiant à la création. */
export interface ProfileSubmission {
  id: string | null;
  profile: { [key: string]: unknown; policies?: unknown } | null;
}
