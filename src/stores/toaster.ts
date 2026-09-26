import { defineStore } from 'pinia';

import type { Toast, ToastAction, ToasterState, ToastLink, ToastVariant } from './types';

/*
 * Durée d'affichage par défaut, reprise de `b-toast` (5 s).
 *
 * Elle ne s'applique qu'aux toasts qui ne rapportent pas d'erreur : un message
 * d'erreur qui disparaît tout seul est un message perdu (ADR-0020).
 */
const DEFAULT_AUTO_HIDE_MS = 5000;
const PERSISTENT_VARIANTS: ToastVariant[] = ['danger', 'warning'];

let nextId = 0;

export interface PushToastOptions {
  actions?: ToastAction[];
  /** `false` pour un toast qui attend une réponse : pas de croix. */
  dismissible?: boolean;
  link?: ToastLink;
  message?: string;
  title: string;
  variant?: ToastVariant;
  /** Force la durée : `null` pour rester affiché, un nombre de ms sinon. */
  autoHideAfter?: number | null;
}

export const useToasterStore = defineStore('toaster', {
  state: (): ToasterState => ({
    toasts: [],
  }),
  actions: {
    push(options: PushToastOptions): number {
      const variant = options.variant ?? 'warning';
      const id = ++nextId;

      const toast: Toast = {
        actions: options.actions ?? [],
        dismissible: options.dismissible ?? true,
        id,
        link: options.link ?? null,
        message: options.message ?? '',
        title: options.title,
        variant,
        autoHideAfter:
          options.autoHideAfter !== undefined
            ? options.autoHideAfter
            : PERSISTENT_VARIANTS.includes(variant)
              ? null
              : DEFAULT_AUTO_HIDE_MS,
      };

      this.toasts.push(toast);

      return id;
    },
    dismiss(id: number): void {
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
    },
    clear(): void {
      this.toasts = [];
    },
  },
});
