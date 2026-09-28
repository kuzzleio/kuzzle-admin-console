<template>
  <TagsInputRoot
    :class="
      cn(
        'flex flex-wrap items-center gap-2',
        'rounded-sm border border-input bg-card px-3 py-2',
        'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/10',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        props.class,
      )
    "
    data-slot="tags-input"
    v-bind="forwarded"
  >
    <slot />
  </TagsInputRoot>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import {
  type AcceptableInputValue,
  TagsInputRoot,
  type TagsInputRootEmits,
  type TagsInputRootProps,
  useForwardPropsEmits,
} from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * TagsInput de shadcn-vue (ADR-0019, ADR-0054). La valeur est un tableau, un
 * doublon est refusé ; le clavier (Entrée, Retour arrière, flèches entre les
 * étiquettes) est celui de `reka-ui`.
 *
 * Trois valeurs par défaut diffèrent de `reka-ui`, pour garder le
 * comportement de la primitive précédente :
 *
 * - `add-on-blur` : la saisie en cours devient une étiquette à la perte du
 *   focus, pas seulement à Entrée ;
 * - `delimiter` vide : `reka-ui` coupe à la virgule. Les noms de contrôleurs de
 *   Kuzzle n'en contiennent pas, et une valeur coupée en deux est un piège
 *   silencieux ;
 * - `convert-value` retire les espaces autour de la saisie : « document » et
 *   « document  » ne sont pas deux étiquettes.
 *
 * Un changement de geste, celui de l'amont : sur un champ vide, Retour arrière
 * désigne d'abord la dernière étiquette, et un second appui la retire.
 */
const props = withDefaults(
  defineProps<TagsInputRootProps & { class?: HTMLAttributes['class'] }>(),
  {
    addOnBlur: true,
    convertValue: (value: string): AcceptableInputValue => value.trim(),
    defaultValue: () => [],
    delimiter: '',
    displayValue: (value: AcceptableInputValue): string => value.toString(),
    max: 0,
  },
);
const emits = defineEmits<TagsInputRootEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>
