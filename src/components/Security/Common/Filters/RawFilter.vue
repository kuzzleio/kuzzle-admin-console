<template>
  <form>
    <json-editor
      id="rawsearch"
      ref="jsoneditor"
      myclass="pre_ace"
      :content="filters.raw"
    />
    <div class="row card-action">
      <button
        type="submit"
        class="btn primary waves-effect waves-light"
        @click.prevent="rawSearch"
      >
        {{ labelSearchButton }}
      </button>
      <button
        class="btn-flat waves-effect waves-light"
        @click="resetRawSearch"
      >
        Reset
      </button>
      <span
        v-if="jsonInvalid"
        class="error"
      >Your JSON is not valid</span>
    </div>
  </form>
</template>

<script>
import JsonEditor from '../../../Common/JsonEditor'

export default {
  components: {
    JsonEditor
  },
  props: {
    rawFilter: {
      type: Object,
      default() {
        return {}
      }
    },
    formatFromBasicSearch: Function,
    labelSearchButton: {
      type: String,
      required: false,
      default: 'search'
    },
    sortingEnabled: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      filters: {
        raw: {}
      },
      jsonInvalid: false
    }
  },
  mounted() {
    this.filters.raw = this.rawFilter || {}
  },
  methods: {
    rawSearch() {
      let json = this.$refs.jsoneditor.getJson()

      if (json === null) {
        this.jsonInvalid = true
        return
      }

      this.jsonInvalid = false
      this.filters.raw = json

      this.$emit('filters-raw-search', this.filters.raw)
    },
    resetRawSearch() {
      this.filters.raw = {}
    }
  }
}
</script>
