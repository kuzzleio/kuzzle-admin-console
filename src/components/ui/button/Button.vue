<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { Primitive, type PrimitiveProps } from 'reka-ui';

import { cn } from '@/lib/utils';

import { buttonVariants, type ButtonVariants } from '.';

/*
 * `Button` de shadcn-vue (ADR-0054), sur `Primitive` de `reka-ui`.
 *
 * `as` prend une balise ou un composant : `Primitive` passe une chaîne telle
 * quelle à `h()`, et `as="router-link"` rendrait un élément `<router-link>`
 * inconnu. Un lien de routeur s'écrit `:as="RouterLink"`, ou `as-child` autour
 * d'un `<router-link>`.
 */
interface Props extends PrimitiveProps {
  class?: HTMLAttributes['class'];
  size?: ButtonVariants['size'];
  variant?: ButtonVariants['variant'];
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
});
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ size, variant }), props.class)"
    data-slot="button"
  >
    <slot />
  </Primitive>
</template>
