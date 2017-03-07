<template>
  <form>
    <json-editor
      id="rawsearch"
      ref="jsoneditor"
      myclass="pre_ace"
      :content="filters.raw"
    >
    </json-editor>
    <div class="row card-action">
      <button type="submit" class="btn primary waves-effect waves-light" @click.prevent="rawSearch">{{labelSearchButton}}</button>
      <button class="btn-flat waves-effect waves-light" @click="resetRawSearch">Reset</button>
      <span class="error" v-if="jsonInvalid">Your JSON is not valid</span>
    </div>
  </form>
</template>

<script>
  import JsonEditor from '../../Common/JsonEditor'

  export default {
    props: {
      rawFilter: {
        type: Object,
        'default' () {
          return {}
        }
      },
      formatFromBasicSearch: Function,
      formatSort: Function,
      basicFilterForm: {
        type: Object,
        'default' () {
          return {}
        }
      },
      labelSearchButton: {
        type: String,
        required: false,
        'default': 'search'
      },
      sortingEnabled: {
        type: Boolean,
        required: false,
        'default': true
      }
    },
    components: {
      JsonEditor
    },
    data () {
      return {
        filters: {
          raw: {}
        }
      }
    },
    methods: {
      rawSearch () {
        let json = this.$refs.jsoneditor.getJson()

        if (json === null) {
          this.jsonInvalid = true
          return
        }

        this.jsonInvalid = false
        this.filters.raw = json

        this.$emit('filters-raw-search', this.filters.raw)
      },
      fillRawWithBasic () {
        if (this.basicFilterForm.basic) {
          this.filters.raw = this.formatFromBasicSearch(this.basicFilterForm.basic)
        }
        if (this.sortingEnabled && this.basicFilterForm.sorting) {
          this.filters.raw = {...this.filters.raw, sort: this.formatSort(this.basicFilterForm.sorting)}
        }

        this.$emit('json-editor-refresh')
      },
      resetRawSearch () {
        this.filters.raw = {}
      }
    },
    mounted () {
      this.filters.raw = this.rawFilter || {}
    }
  }
</script>
