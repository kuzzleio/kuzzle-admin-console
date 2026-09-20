<template>
  <div class="tw:flex tw:min-h-full tw:flex-col tw:items-center tw:justify-center tw:text-center">
    <Spinner class="tw:text-primary" data-cy="main-spinner" label="Loading" size="lg" />
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
