<template>
  <div>
   <HistoryFilterRaw
    v-for="(filter, i) in filters"
    :key="i"
    :index="index"
    :collection="collection"
    :filter="filter"
   />
  </div>
</template>

<script>
import JsonFormatter from '../../../directives/json-formatter.directive'
import * as filterManager from '../../../services/filterManager'
import HistoryFilterRaw from './HistoryFilterRaw'

export default {
  name: 'HistoryFilter',
  directives: {
    JsonFormatter
  },
  components: {
    HistoryFilterRaw
  },
  props: {
    index: String,
    collection: String,
  },
  data() {
    return {
      expanded: false,
      filters: [],
    }
  },
  computed: {
    formattedDocument() {
      var document = {
        plop: 'oui'
      }
      return document
    }
  },
  mounted() {
    this.filters = filterManager.loadHistoyToLocalStorage(this.index, this.collection)
  },
  watch: {},
  methods: {
    toggleCollapse() {
      console.log(filterManager.loadHistoyToLocalStorage(this.index, this.collection));

      this.expanded = !this.expanded
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
