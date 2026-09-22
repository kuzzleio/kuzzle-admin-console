import Vue from 'vue';

import { useToasterStore, type PushToastOptions } from '@/stores';

/**
 * `this.$toast` — l'API impérative des notifications (ADR-0020).
 *
 * Elle remplace `this.$bvToast.toast(message, { title, variant, … })`, appelée
 * depuis 28 fichiers. Le nom et la forme sont ceux de l'amont (`toast.error()`
 * de *sonner*), et non ceux de `bootstrap-vue` : un toast est déclenché par un
 * événement, pas rendu par un état, et c'est le seul cas où ADR-0010 ne
 * s'applique pas.
 *
 * Le plugin ne fait que déléguer au store, qui garde la liste. En phase 4, un
 * composant en Composition API appellera `useToasterStore()` directement et ce
 * fichier pourra partir.
 */
export interface ToastApi {
  danger: (title: string, message?: string) => number;
  info: (title: string, message?: string) => number;
  show: (options: PushToastOptions) => number;
  success: (title: string, message?: string) => number;
  warning: (title: string, message?: string) => number;
}

export const toastApi: ToastApi = {
  danger: (title, message) => useToasterStore().push({ message, title, variant: 'danger' }),
  info: (title, message) => useToasterStore().push({ message, title, variant: 'info' }),
  show: (options) => useToasterStore().push(options),
  success: (title, message) => useToasterStore().push({ message, title, variant: 'success' }),
  warning: (title, message) => useToasterStore().push({ message, title, variant: 'warning' }),
};

Vue.prototype.$toast = toastApi;
