<template>
  <DialogTrigger data-slot="dialog-trigger" v-bind="props">
    <slot />
  </DialogTrigger>
</template>

<script setup lang="ts">
import { DialogTrigger, type DialogTriggerProps } from 'reka-ui';

/* DialogTrigger de shadcn-vue (ADR-0054). */
const props = defineProps<DialogTriggerProps>();
</script>
