import { markRaw } from 'vue';
import { defineStore } from 'pinia';
import { type ExternalToast, toast } from 'vue-sonner';

import type { ToastAction, ToastLink, ToastVariant } from './types';

import ToastBody from '@/components/Common/ToastBody.vue';

/*
 * Durée d'affichage par défaut, reprise de `b-toast` (5 s).
 *
 * Elle ne s'applique qu'aux toasts qui ne rapportent pas d'erreur : un message
 * d'erreur qui disparaît tout seul est un message perdu (ADR-0020).
 */
const DEFAULT_AUTO_HIDE_MS = 5000;
const PERSISTENT_VARIANTS: ToastVariant[] = ['danger', 'warning'];

/* `danger` est le nom de la console ; `error`, celui de sonner. */
const SONNER_TYPES = {
  danger: 'error',
  info: 'info',
  success: 'success',
  warning: 'warning',
} as const;

/* Le corps est un composant, qui ne doit pas devenir réactif. */
const body = markRaw(ToastBody);

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

/*
 * useToasterStore — l'API des notifications de la console (ADR-0020,
 * ADR-0058).
 *
 * La liste, les minuteries, l'empilement et l'annonce aux lecteurs d'écran
 * sont ceux de `vue-sonner`, rendus par le `Toaster` monté dans `App.vue`. Le
 * store garde ce qui est propre à la console : ses quatre variantes, la règle
 * qui fait persister une erreur, le lien et les actions dans le corps
 * (`ToastBody`). Les sites d'appel n'ont pas changé.
 */
export const useToasterStore = defineStore('toaster', {
  actions: {
    push(options: PushToastOptions): number {
      const variant = options.variant ?? 'warning';
      const id = ++nextId;
      const autoHideAfter =
        options.autoHideAfter !== undefined
          ? options.autoHideAfter
          : PERSISTENT_VARIANTS.includes(variant)
            ? null
            : DEFAULT_AUTO_HIDE_MS;
      const dismissible = options.dismissible ?? true;
      const hasBody = Boolean(options.message || options.link || options.actions?.length);

      const data: ExternalToast = {
        id,
        closeButton: dismissible,
        /* Sans croix, le toast ne se ferme pas non plus d'un glisser. */
        dismissible,
        duration: autoHideAfter ?? Number.POSITIVE_INFINITY,
        ...(hasBody && {
          componentProps: {
            actions: options.actions ?? [],
            link: options.link ?? null,
            message: options.message ?? '',
            toastId: id,
          },
          description: body,
        }),
      };

      toast[SONNER_TYPES[variant]](options.title, data);

      return id;
    },
    dismiss(id: number): void {
      toast.dismiss(id);
    },
    clear(): void {
      toast.dismiss();
    },
  },
});
