<template>
  <div class="search-filter">
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
    name: 'Filters',
    props: {
      basicFilter: Object
    },
    components: {
      BasicFilter
    },
    methods: {
      broadcastFilterBasicSearch (filters, sorting) {
        this.$emit('filters-basic-search', filters, sorting)
      }
    }
  }
</script>
