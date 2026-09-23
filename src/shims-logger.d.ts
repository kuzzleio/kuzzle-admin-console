/*
 * `this.$log` est installé sur `globalProperties` par `plugins/logger.ts`
 * (ADR-0026).
 *
 * Même raison que pour `$toast` : sans cette déclaration, tout composant repris
 * en TypeScript échoue sur `TS2339: Property '$log' does not exist`, et la
 * tentation est de retirer la trace plutôt que de la typer.
 *
 * Le type vient maintenant du wrapper lui-même. Il était recopié à la main tant
 * que `vuejs-logger` ne publiait pas les siens.
 *
 * L'augmentation vise `ComponentCustomProperties` : `vue/types/vue` est
 * l'espace de noms de Vue 2 et ne décrit plus rien depuis la bascule.
 */
import 'vue';

import type { Logger } from '@/plugins/logger';

declare module 'vue' {
  interface ComponentCustomProperties {
    $log: Logger;
  }
}
