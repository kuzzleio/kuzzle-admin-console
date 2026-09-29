import { type ToastApi, toastApi } from '@/plugins/toast';

/*
 * useToast — l'API des notifications pour un `<script setup>` (ADR-0060).
 *
 * La même que `this.$toast` (ADR-0020), sous la même forme : un site d'appel
 * passe de `this.$toast.danger(…)` à `toast.danger(…)` sans rien changer
 * d'autre. Quand le dernier composant en Options API sera converti, le plugin
 * et son shim partiront, et l'API vivra ici.
 */
export function useToast(): ToastApi {
  return toastApi;
}
