<template>
  <div class="toast-error" />
</template>

<script setup lang="ts">
import { useToasterStore } from '@/stores';

const toasterStore = useToasterStore();

toasterStore.$subscribe((_mutation, state) => {
  if (state.toast !== undefined) {
    // TODO: Import Materialize properly
    // @ts-expect-error
    M.toast({
      html: state.toast.text,
      inDuration: state.toast.duration,
      classes: state.toast.cssClass,
      completeCallback: state.toast.cb,
    });
  }
});
</script>
