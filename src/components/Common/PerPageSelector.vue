<template>
  <div>
    Show
    <b-form-select
      class="mx-2"
      style="width: unset"
      :options="itemsPerPage"
      :value="pageSize"
      @change="$emit('change-page-size', $event)"
    >
    </b-form-select>
    <span v-if="totalDocuments">of {{ totalDocuments }} total items.</span>
  </div>
</template>

<script>
export default {
  props: {
    totalDocuments: Number,
    currentPageSize: Number
  },
  data() {
    return {
      itemsPerPage: [10, 25, 50, 100, 500]
    }
  },
  computed: {
    pageSize() {
      return this.currentPageSize || 25
    }
  }
}
</script>

<style></style>
