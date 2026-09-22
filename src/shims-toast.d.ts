/*
 * `this.$toast` est posé sur le prototype par `plugins/toast.ts` (ADR-0020).
 *
 * Même raison que pour `$log` : sans cette déclaration, tout composant repris
 * en TypeScript échoue sur `TS2339: Property '$toast' does not exist`, et la
 * tentation est de retirer la notification plutôt que de la typer.
 *
 * À revoir en phase 4 : un composant en Composition API appellera
 * `useToasterStore()` directement, et ce fichier pourra partir avec le plugin.
 */
import 'vue';

import type { ToastApi } from '@/plugins/toast';

declare module 'vue/types/vue' {
  interface Vue {
    $toast: ToastApi;
  }
}
