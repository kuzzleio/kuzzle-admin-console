<template>
  <span>
    <span v-if="highlightIndex >= 0">
      {{ value.substring(0, highlightIndex)
      }}<strong>{{
        value.substring(highlightIndex, highlightIndex + filter.length)
      }}</strong
      >{{ value.substring(highlightIndex + filter.length) }}
    </span>
    <span v-else>{{ value }}</span>
  </span>
</template>

<script>
export default {
  name: 'HighlightedSpan',
  props: {
    value: {
      type: String,
      required: true
    },
    filter: {
      type: String,
      required: true
    }
  },
  computed: {
    highlightIndex() {
      if (
        !this.value ||
        this.value === '' ||
        !this.filter ||
        this.filter === ''
      ) {
        return -1 ;
      }

      return this.value.toLowerCase().indexOf(this.filter.toLowerCase())
    }
  }
} ;
</script>

<style></style>
