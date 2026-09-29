<template>
  <span>
    <span v-if="highlightIndex >= 0">
      {{ value.substring(0, highlightIndex)
      }}<strong>{{ value.substring(highlightIndex, highlightIndex + filter.length) }}</strong
      >{{ value.substring(highlightIndex + filter.length) }}
    </span>
    <span v-else>{{ value }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  filter: string;
  value: string;
}>();

const highlightIndex = computed((): number => {
  if (!props.value || props.value === '' || !props.filter || props.filter === '') {
    return -1;
  }
  return props.value.toLowerCase().indexOf(props.filter.toLowerCase());
});
</script>

<style></style>
