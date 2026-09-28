<template>
  <SelectLabel
    :class="cn('px-2 py-1.5 pl-8 font-sans text-xs font-medium text-muted-foreground', props.class)"
    data-slot="select-label"
    v-bind="delegatedProps"
  >
    <slot />
  </SelectLabel>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { SelectLabel, type SelectLabelProps } from 'reka-ui';

import { cn } from '@/lib/utils';

/* Intitulé d'un groupe d'options. Décalé comme les options pour que les textes
 * s'alignent, coche comprise ; `reka-ui` en fait le nom du `SelectGroup`. */
const props = defineProps<SelectLabelProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>
