<template>
  <div :class="hidden">
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
            >{{ filter.name }}</a
          >
          <b-button variant="link" :title="'Edit Filter'" @click="OpenModal">
            <i class="fa fa-pencil-alt" />
          </b-button>
          <b-button
            variant="link"
            :title="'Bookmark Filter'"
            @click="switchBookmark"
          >
            <i
              :class="filter.bookmark === true ? 'fa fa-star' : 'far fa-star'"
              aria-hidden="true"
            />
          </b-button>
        </b-col>
        <b-col cols="2">
          <div class="float-right">
            <b-button variant="link" @click="useFilter" :title="'Edit Filter'">
              <i class="fa fa-search" />
            </b-button>
            <b-button
              variant="link"
              @click="deleteFilter"
              :title="'Delete Filter'"
            >
              <i class="fa fa-trash" />
            </b-button>
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-collapse v-model="expanded" class="ml-3 w-100">
          <pre>
 {{ getFilter() }}
          </pre>
        </b-collapse>
      </b-row>
    </b-container>
    <b-modal
      size="lg"
      :id="`changeNameHistoryFilter-${filter.id}`"
      title="you want to change this filter ?"
      @ok="SubmitChange"
      @cancel="cancelChange"
      @close="cancelChange"
    >
      <b-input v-model="filter.name" type="text" required />
      <b-form-checkbox v-model="filter.bookmark">
        {{
          filter.bookmark === true
            ? 'Remove this filter to my bookmark'
            : 'Add this filter to my bookmark'
        }}
      </b-form-checkbox>
    </b-modal>
  </div>
</template>

<script>
import JsonFormatter from '../../../directives/json-formatter.directive'
import * as filterManager from '../../../services/filterManager'
import { mapGetters } from 'vuex'

export default {
  name: 'HistoryFilterRaw',
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
      hidden: false,
      expanded: false,
      oldName: this.filter.name,
      oldBookmark: this.filter.bookmark
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['wrapper'])
  },
  watch: {},
  methods: {
    switchBookmark() {
      filterManager.modifieHistoryRawFromLocalStorage(
        this.filter.id,
        this.filter.name,
        !this.filter.bookmark,
        this.index,
        this.collection
      )
      this.filter.bookmark = !this.filter.bookmark
    },
    cancelChange() {
      this.filter.name = this.oldName
      this.filter.bookmark = this.oldBookmark
    },
    SubmitChange() {
      filterManager.modifieHistoryRawFromLocalStorage(
        this.filter.id,
        this.filter.name,
        this.filter.bookmark,
        this.index,
        this.collection
      )
    },
    OpenModal() {
      this.$bvModal.show('changeNameHistoryFilter-' + this.filter.id)
    },
    deleteFilter() {
      filterManager.removeHistoryRawFromLocalStorage(
        this.filter.id,
        this.index,
        this.collection
      )
      this.hidden = 'hidden'
    },
    useFilter() {
      if (this.filter.active == 'raw') {
        this.$parent.$emit('filter-raw-submitted', this.filter.raw, true)
      }
      if (this.filter.active == 'basic') {
        this.$parent.$emit(
          'filter-basic-submitted',
          this.filter.basic,
          this.filter.sorting,
          true
        )
      }
    },
    getFilter() {
      let loadedFilter = Object.assign(new filterManager.Filter(), this.filter)
      if (loadedFilter.active == 'basic') return loadedFilter.basic
      if (loadedFilter.active == 'raw') return loadedFilter.raw
    },
    toggleCollapse() {
      this.expanded = !this.expanded
    }
  }
}
</script>

<style lang="scss" scoped>
.hidden {
  display: none;
}
</style>
