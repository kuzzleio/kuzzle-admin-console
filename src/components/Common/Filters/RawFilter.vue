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
      <button
        v-if="actionButtonsVisible"
        type="submit"
        class="btn primary waves-effect waves-light"
        @click.prevent="submitSearch">
        {{submitButtonLabel}}
      </button>
      <button
        v-if="actionButtonsVisible"
        class="btn-flat waves-effect waves-light"
        @click="resetSearch">
        Reset
      </button>
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
      default() {
        return {}
      }
    },
    // TODO
    formatFromBasicSearch: Function,
    submitButtonLabel: {
      type: String,
      required: false,
      default: 'search'
    },
    actionButtonsVisible: {
      type: Boolean,
      required: false,
      default: true
    },
    sortingEnabled: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  components: {
    JsonEditor
  },
  data() {
    return {
      filters: {
        raw: {}
      },
      jsonInvalid: false
    }
  },
  methods: {
    submitSearch() {
      let json = this.$refs.jsoneditor.getJson()

      if (json === null) {
        this.jsonInvalid = true
        return
      }

      this.jsonInvalid = false
      this.filters.raw = json

      this.$emit('update-filter', this.filters.raw)
    },
    resetSearch() {
      this.filters.raw = null
      this.$emit('update-filter', this.filters.raw)
    }
  },
  watch: {
    rawFilter: {
      immediate: true,
      handler(newValue, oldValue) {
        if (newValue) {
          this.filters.raw = newValue
        } else {
          this.filters.raw = {}
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#rawsearch.pre_ace {
  height: 100px;
}
</style>
