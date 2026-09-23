/*
 * `this.$log` est posé sur le prototype par `plugins/logger.ts` (ADR-0026).
 *
 * Même raison que pour `$toast` : sans cette déclaration, tout composant repris
 * en TypeScript échoue sur `TS2339: Property '$log' does not exist`, et la
 * tentation est de retirer la trace plutôt que de la typer.
 *
 * Le type vient maintenant du wrapper lui-même. Il était recopié à la main tant
 * que `vuejs-logger` ne publiait pas les siens.
 */
import 'vue';

import type { Logger } from '@/plugins/logger';

declare module 'vue/types/vue' {
  interface Vue {
    $log: Logger;
  }
}
