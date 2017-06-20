<template>
    <div class="search-filter">
        <div v-if="!basicFilter" class="card-panel card-header">
            <div class="row margin-bottom-0 filters">
                <basic-filter @filters-basic-search="broadcastFilterBasicSearch">
                </basic-filter>
            </div>
        </div>
    </div>
</template>

<script>
  import BasicFilter from './Filters/BasicFilter'
  import Vue from 'vue'

  export default {
    name: 'Filters',
    props: {
      basicFilter: Object
    },
    components: {
      BasicFilter
    },
    watch: {
      'displayBlockFilter' () {
        this.$emit('json-editor-refresh')
      },
      'tabActive' () {
        this.$emit('json-editor-refresh')
      }
    },
    data () {
      return {
        displayBlockFilter: false,
        tabActive: 'basic',
        jsonInvalid: false,
        objectTabActive: null
      }
    },
    methods: {
      switchFilter (name) {
        this.tabActive = name
      },
      broadcastFilterBasicSearch (filters, sorting) {
        this.displayBlockFilter = false
        this.$emit('filters-basic-search', filters, sorting)
      }
    },
    mounted () {
      Vue.nextTick(() => {
        window.document.addEventListener('keydown', this.handleEsc)
      })
    },
    destroyed () {
      window.document.removeEventListener('keydown', this.handleEsc)
    }
  }
</script>
