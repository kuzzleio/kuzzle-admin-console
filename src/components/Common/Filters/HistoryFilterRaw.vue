<template>
  <div>
    <b-container fluid>
      <b-row align-h="between" no-gutters>
        <b-col cols="10" class="py-1">
          <i
            @click="toggleCollapse"
            :class="
              `fa fa-caret-${
                expanded ? 'down' : 'right'
              } mr-2  d-inline-block align-middle`
            "
            aria-hidden="true"
          />
          <a
            class="d-inline-block align-middle code pointer"
            @click="toggleCollapse"
            >{{ filter.name}}</a
          >
          <b-button
            class="DocumentListItem-update"
            href=""
            variant="link"
            :title="'Edit Document'"
          >
            <i class="fa fa-pencil-alt" />
          </b-button>
        </b-col>
        <b-col cols="2">
          <div class="float-right">
            <b-button
              class="DocumentListItem-update"
              href=""
              variant="link"
              :title="'Edit Document'"
            >
              <i class="fa fa-search" />
            </b-button>
            <b-button
              class="DocumentListItem-delete"
              href=""
              variant="link"
              :title="'Delete Document'"
            >
              <i class="fa fa-trash" />
            </b-button>
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-collapse
          v-model="expanded"
          class="ml-3 DocumentListItem-content w-100"
        >
          <pre>
 {{ getFilter() }}
          </pre>
        </b-collapse>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import JsonFormatter from '../../../directives/json-formatter.directive'
import * as filterManager from '../../../services/filterManager'
import { mapGetters } from 'vuex'

export default {
  name: 'HistoryFilter',
  directives: {
    JsonFormatter
  },
  props: {
    index: String,
    collection: String,
    filter: Object
  },
  data() {
    return {
      expanded: false
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['wrapper'])
  },
  watch: {},
  methods: {
    getFilter() {
      let loadedFilter = Object.assign(new filterManager.Filter(), this.filter)
      
      if (loadedFilter.active == "basic")
        return loadedFilter.basic
      if (loadedFilter.active == "raw")
        return loadedFilter.raw
    },
    toggleCollapse() {
      this.expanded = !this.expanded
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
