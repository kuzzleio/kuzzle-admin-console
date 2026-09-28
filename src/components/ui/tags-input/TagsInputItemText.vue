<template>
  <TagsInputItemText
    :class="cn('truncate', props.class)"
    data-slot="tags-input-item-text"
    v-bind="forwardedProps"
  />
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { TagsInputItemText, type TagsInputItemTextProps, useForwardProps } from 'reka-ui';

import { cn } from '@/lib/utils';

/*
 * TagsInputItemText de shadcn-vue (ADR-0019, ADR-0054) : rend la valeur de
 * l'étiquette (`display-value` de la racine) ; le site d'appel n'a rien à
 * passer.
 */
const props = defineProps<TagsInputItemTextProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
const forwardedProps = useForwardProps(delegatedProps);
</script>
