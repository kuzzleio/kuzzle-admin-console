<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn(badgeVariants({ variant }), props.class)"
    data-slot="badge"
  >
    <slot />
  </Primitive>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { Primitive, type PrimitiveProps } from 'reka-ui';

import { cn } from '@/lib/utils';

import { badgeVariants, type BadgeVariants } from '.';

/* Badge de shadcn-vue (ADR-0054). Les variantes sont dans `index.ts`. */
interface Props extends PrimitiveProps {
  class?: HTMLAttributes['class'];
  variant?: BadgeVariants['variant'];
}

const props = withDefaults(defineProps<Props>(), {
  as: 'span',
});
</script>
