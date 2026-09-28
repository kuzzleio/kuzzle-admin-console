<template>
  <Label
    v-bind="delegatedProps"
    :class="cn('font-sans text-label font-bold uppercase text-label-slate', props.class)"
    data-slot="label"
  >
    <slot />
  </Label>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { Label, type LabelProps } from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * Label de shadcn-vue (ADR-0054), sur `Label` de `reka-ui` : un double clic ne
 * sélectionne plus le texte du libellé.
 *
 * L'association au champ reste au site d'appel (`for` / `id`) : c'est lui qui
 * connaît l'identifiant, et un libellé qui devinerait son champ serait plus
 * fragile qu'utile.
 */
const props = defineProps<LabelProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>
