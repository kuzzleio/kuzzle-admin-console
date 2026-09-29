<template>
  <div class="flex min-h-full flex-col items-center justify-center text-center">
    <Spinner class="text-primary" data-cy="main-spinner" label="Loading" size="lg" />
  </div>
</template>

<script setup lang="ts">
import { Spinner } from '@/components/ui/spinner';
</script>
