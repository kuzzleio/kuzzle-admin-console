<template>
  <div class="flex min-h-full flex-col items-center justify-center text-center">
    <Spinner class="text-primary" data-cy="main-spinner" label="Loading" size="lg" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { Spinner } from '@/components/ui/spinner';

export default defineComponent({
  name: 'MainSpinner',
  components: {
    Spinner,
  },
});
</script>
