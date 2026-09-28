<template>
  <TagsInputItemDelete
    :aria-label="`Remove ${item.displayValue.value}`"
    :aria-labelledby="undefined"
    :class="
      cn(
        // Sans preflight (ADR-0008), un `<button>` garde la bordure et le fond
        // du navigateur : les deux sont retirés explicitement (G-021).
        'appearance-none border-0 bg-transparent p-0',
        'cursor-pointer text-xs leading-none opacity-60',
        'outline-none hover:opacity-100',
        'focus-visible:ring-2 focus-visible:ring-ring',
        'data-disabled:cursor-not-allowed',
        props.class,
      )
    "
    data-slot="tags-input-item-delete"
    v-bind="forwardedProps"
  >
    <slot><i aria-hidden="true" class="fa fa-times" /></slot>
  </TagsInputItemDelete>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import {
  injectTagsInputItemContext,
  TagsInputItemDelete,
  type TagsInputItemDeleteProps,
  useForwardProps,
} from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * TagsInputItemDelete de shadcn-vue (ADR-0019, ADR-0054).
 *
 * Écart avec `reka-ui`, qui nomme le bouton par le texte de l'étiquette
 * (`aria-labelledby`) : un lecteur d'écran annoncerait « document, bouton »,
 * sans dire que le bouton retire. Le bouton se nomme « Remove document », et
 * `aria-labelledby`, qui l'emporterait sur `aria-label`, est retiré.
 */
const props = defineProps<TagsInputItemDeleteProps & { class?: HTMLAttributes['class'] }>();

const item = injectTagsInputItemContext();

const delegatedProps = reactiveOmit(props, 'class');
const forwardedProps = useForwardProps(delegatedProps);
</script>
