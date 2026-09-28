<template>
  <SelectItem :class="cn(itemClasses(), props.class)" data-slot="select-item" v-bind="forwarded">
    <span aria-hidden="true" class="absolute left-2 flex w-4 justify-center">
      <SelectItemIndicator>
        <slot name="indicator-icon">
          <i class="fa fa-check" />
        </slot>
      </SelectItemIndicator>
    </span>

    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import {
  SelectItem,
  type SelectItemEmits,
  SelectItemIndicator,
  type SelectItemProps,
  SelectItemText,
  useForwardPropsEmits,
} from 'reka-ui';

import { cn } from '@/lib/utils';
import { itemClasses } from './item-classes';

/*
 * SelectItem de shadcn-vue (ADR-0014, ADR-0054) : un `[role="option"]` avec
 * `aria-selected`. `value` ne peut pas être la chaîne vide, que `reka-ui`
 * réserve à « aucune valeur » (le `placeholder` s'affiche).
 *
 * Le libellé est déclaré à la racine par `SelectItemText`, même liste fermée :
 * `reka-ui` rend alors les options hors du document. `SelectValue` connaît donc
 * le libellé de l'option retenue dès le premier rendu.
 */
const props = defineProps<SelectItemProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<SelectItemEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>
