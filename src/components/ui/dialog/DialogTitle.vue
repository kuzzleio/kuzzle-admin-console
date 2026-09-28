<template>
  <DialogTitle
    :class="cn('font-sans text-title font-bold text-card-foreground', props.class)"
    data-slot="dialog-title"
    v-bind="delegatedProps"
  >
    <slot />
  </DialogTitle>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { DialogTitle, type DialogTitleProps } from 'reka-ui';

import { cn } from '@/lib/utils';

/* Titre de la modale (ADR-0054). `reka-ui` lui donne son `id` et le relie au
 * panneau par `aria-labelledby`. */
const props = defineProps<DialogTitleProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>
