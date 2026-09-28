<template>
  <TagsInputInput
    :class="
      cn(
        'min-w-32 flex-1 appearance-none border-0 bg-transparent p-0',
        'font-sans text-sm text-foreground outline-none',
        'placeholder:text-muted-foreground',
        'disabled:cursor-not-allowed',
        props.class,
      )
    "
    data-slot="tags-input-input"
    v-bind="forwardedProps"
  />
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { TagsInputInput, type TagsInputInputProps, useForwardProps } from 'reka-ui';

import { cn } from '@/lib/utils';

/* TagsInputInput de shadcn-vue (ADR-0019, ADR-0054). */
const props = defineProps<TagsInputInputProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
const forwardedProps = useForwardProps(delegatedProps);
</script>
