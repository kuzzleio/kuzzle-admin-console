import { useToasterStore, type PushToastOptions } from '@/stores';

/*
 * useToast — l'API impérative des notifications (ADR-0020, ADR-0060).
 *
 * Le nom et la forme sont ceux de l'amont (`toast.error()` de *sonner*), et
 * non ceux de `bootstrap-vue` : un toast est déclenché par un événement, pas
 * rendu par un état, et c'est le seul cas où ADR-0010 ne s'applique pas.
 * L'API ne fait que déléguer au store, qui passe à `vue-sonner` (ADR-0058).
 *
 * Elle vivait dans `plugins/toast.ts`, installée en `this.$toast` sur
 * `globalProperties`. Le dernier composant en Options API converti (lot 13),
 * le plugin et son shim sont partis : l'API vit ici.
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

export function useToast(): ToastApi {
  return toastApi;
}
