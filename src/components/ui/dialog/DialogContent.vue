<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-(--z-modal) flex items-start justify-center overflow-y-auto bg-overlay p-4 sm:p-6"
      data-slot="dialog-overlay"
    >
      <DialogContent
        :class="
          cn(
            'relative my-8 flex w-full max-w-lg flex-col gap-4',
            'rounded-lg border border-border bg-card text-card-foreground',
            'p-6 shadow-modal outline-none',
            props.class,
          )
        "
        data-slot="dialog-content"
        v-bind="{ ...$attrs, ...forwarded }"
        @close-auto-focus="restoreFocus"
        @open-auto-focus="rememberFocus"
        @pointer-down-outside="ignoreScrollbar"
      >
        <slot />

        <DialogClose
          v-if="showCloseButton"
          aria-label="Close"
          class="absolute top-3 right-3 inline-flex size-8 cursor-pointer appearance-none items-center justify-center rounded-sm border-0 bg-transparent p-0 leading-none opacity-60 outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
          data-slot="dialog-close"
        >
          <i aria-hidden="true" class="fa fa-times" />
        </DialogClose>
      </DialogContent>
    </DialogOverlay>
  </DialogPortal>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import {
  DialogClose,
  DialogContent,
  type DialogContentEmits,
  type DialogContentProps,
  DialogOverlay,
  DialogPortal,
  useForwardPropsEmits,
} from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * Le panneau de la modale (ADR-0010, ADR-0054), dans la disposition de
 * `DialogScrollContent` de l'amont : le fond assombri défile, le panneau est
 * calé en haut. Une modale plus haute que l'écran — la création d'une
 * connexion — reste lisible en entier.
 *
 * `aria-labelledby` et `aria-describedby` sont posés par `reka-ui`, qui relie
 * le panneau à son `DialogTitle` et à son `DialogDescription` : un `id` posé à
 * la main sur l'un d'eux casserait ce lien.
 *
 * **Un écart avec l'amont, le retour du focus.** `reka-ui` rend le focus au
 * `DialogTrigger` ; la console n'en a aucun — ses modales s'ouvrent par un
 * état, depuis un bouton qui vit souvent dans un autre composant — et le focus
 * tombait sur `<body>`. Le panneau retient l'élément qui avait le focus à
 * l'ouverture et le lui rend à la fermeture, comme le faisait la primitive
 * précédente. Un site d'appel qui veut autre chose appelle `preventDefault()`
 * sur `close-auto-focus`.
 *
 * Un clic sur la barre de défilement du fond n'est pas un clic à côté : c'est
 * le correctif de `DialogScrollContent`, repris tel quel.
 *
 * La croix de fermeture est rendue par défaut (`showCloseButton`, comme en
 * amont), après le slot dans le DOM : le focus d'ouverture reste sur le premier
 * champ. Elle mesure 32 px (WCAG 2.5.8).
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    DialogContentProps & { class?: HTMLAttributes['class']; showCloseButton?: boolean }
  >(),
  { showCloseButton: true },
);
const emits = defineEmits<DialogContentEmits>();

const delegatedProps = reactiveOmit(props, 'class', 'showCloseButton');
const forwarded = useForwardPropsEmits(delegatedProps, emits);

let previouslyFocused: HTMLElement | null = null;

function rememberFocus(): void {
  previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
}

function restoreFocus(event: Event): void {
  if (event.defaultPrevented) {
    return;
  }
  event.preventDefault();
  previouslyFocused?.focus();
  previouslyFocused = null;
}

function ignoreScrollbar(event: CustomEvent<{ originalEvent: PointerEvent }>): void {
  const { originalEvent } = event.detail;
  const target = originalEvent.target as HTMLElement;
  if (originalEvent.offsetX > target.clientWidth || originalEvent.offsetY > target.clientHeight) {
    event.preventDefault();
  }
}
</script>
