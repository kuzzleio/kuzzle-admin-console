/* Un utilisateur tel que le rend `performSearchUsers` : son contenu à plat,
   l'identifiant en `id` (et non `_id`), ses identifiants par stratégie. */
export interface UserDocument {
  [key: string]: unknown;
  additionalAttribute?: { name: string; value: unknown };
  credentials?: { [strategy: string]: { [field: string]: unknown } | undefined };
  id: string;
  profileIds?: string[];
}

/* Les identifiants saisis, par stratégie puis par champ. */
export type Credentials = Record<string, Record<string, string | number>>;
