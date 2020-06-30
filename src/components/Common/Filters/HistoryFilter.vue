<template>
  <div>
   <HistoryFilterRaw
    v-for="(filter, i) in filters"
    :key="i"
    :index="index"
    :collection="collection"
    :filter="filter"
    class="HistoryFilterRaw p-1"
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
      filters: [],
    }
  },
  mounted() {
    this.filters = filterManager.loadHistoyToLocalStorage(this.index, this.collection)
  },
}
</script>

<style lang="scss" scoped>
.HistoryFilterRaw {
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
}
</style>
