/*
 * Ce que manipule API Action. La requête est saisie à la main dans un éditeur
 * JSON : hormis `controller` et `action`, rien n'y est garanti.
 */
export interface ApiQuery {
  [key: string]: unknown;
  action: string | null;
  body?: Record<string, unknown>;
  controller: string | null;
}

/* La réponse du SDK, ou l'erreur qu'il a levée ; `''` tant que rien n'a tourné. */
export type QueryResponse = '' | object;

export interface ApiTab {
  name: string;
  query: ApiQuery;
  response: QueryResponse;
  saved: boolean;
  /* Rang de la requête sauvegardée que l'onglet affiche, s'il y en a une. */
  savedIdx: number | null;
}

/* `server:publicApi` : les actions sans route HTTP n'ont pas de `http`. */
export type PublicApi = Record<
  string,
  Record<string, { http?: Array<{ url: string; verb: string }> }>
>;

/* Les `paths` de `server:openapi`, par chemin puis par verbe. */
export type OpenApiPaths = Record<
  string,
  Record<
    string,
    {
      parameters?: Array<{ name: string }>;
      requestBody?: {
        content: Record<string, { schema: { properties: Record<string, { type?: string }> } }>;
      };
    }
  >
>;
