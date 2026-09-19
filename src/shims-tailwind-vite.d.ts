/*
 * `@tailwindcss/vite` ne publie ses types qu'en `.d.mts`, que le
 * `moduleResolution: "node"` du projet ne sait pas résoudre — `vue-tsc` signale
 * alors un `TS2307` sur `vite.config.ts`.
 *
 * Passer à `moduleResolution: "bundler"` résout ce cas **et** l'erreur
 * préexistante sur `rollup/parseAst`, mais fait apparaître trois erreurs
 * nouvelles dans `node_modules` (`@vuelidate/core`, `kuzzle-sdk-v7`). C'est une
 * décision de toolchain qui appartient à la phase 0, pas à la PR qui branche
 * Tailwind : ce shim la laisse ouverte au lieu de la trancher en passant.
 *
 * À supprimer le jour où `moduleResolution` est repris.
 */
declare module '@tailwindcss/vite' {
  import type { Plugin } from 'vite';

  const tailwindcss: () => Plugin[];
  export default tailwindcss;
}
