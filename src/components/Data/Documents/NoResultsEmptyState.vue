<template>
  <div class="tw:flex tw:items-center tw:justify-center tw:gap-6 tw:py-6">
    <i aria-hidden="true" class="fa fa-5x fa-search tw:text-muted-foreground" />
    <div class="tw:max-w-xl">
      <h3 class="tw:font-sans tw:text-xl tw:font-bold tw:text-muted-foreground">
        There is no result matching your query. Please try with another filter.
      </h3>
      <p class="tw:mt-2 tw:font-sans tw:text-sm tw:italic">
        Learn more about filtering syntax on
        <a
          class="tw:text-secondary tw:underline tw:underline-offset-4"
          href="https://docs.kuzzle.io/core/2/guides/elasticsearch/"
          rel="noopener noreferrer"
          target="_blank"
          >Kuzzle Elasticsearch Cookbook</a
        >
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'NoResultsEmptyState',
});
</script>
