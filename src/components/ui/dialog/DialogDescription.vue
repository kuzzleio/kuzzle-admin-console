<template>
  <DialogDescription
    :class="cn('font-sans text-sm leading-normal text-muted-foreground', props.class)"
    data-slot="dialog-description"
    v-bind="delegatedProps"
  >
    <slot />
  </DialogDescription>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { DialogDescription, type DialogDescriptionProps } from 'reka-ui';

import { cn } from '@/lib/utils';

/* Description de la modale (ADR-0054), reliée au panneau par
 * `aria-describedby`. */
const props = defineProps<DialogDescriptionProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>
