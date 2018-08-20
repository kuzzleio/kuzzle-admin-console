<template>
  <div class="RolesFilters">
    <div class="card-panel card-header">
      <div class="row filters margin-bottom-0">
        <basic-filter @filters-basic-search="broadcastFilterBasicSearch">
        </basic-filter>
      </div>
    </div>
  </div>
</template>

<script>
import BasicFilter from './Filters/BasicFilter'

export default {
  name: 'RolesFilters',
  props: {
    basicFilter: Object
  },
  components: {
    BasicFilter
  },
  methods: {
    broadcastFilterBasicSearch(filters, sorting) {
      this.$emit('filters-basic-search', filters, sorting)
    }
  }
}
</script>
