<template>
  <li class="list-group-item p-1">
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
            :title="'Favori Filter'"
            @click="favorisUpdate"
          >
            <i
              :class="IsFavori() === true ? 'fa fa-star' : 'far fa-star'"
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
      title="you want to change this filter name ?"
      @ok="SubmitChange"
      @cancel="cancelChange"
      @close="cancelChange"
    >
      <b-input v-model="filter.name" type="text" required />
    </b-modal>
  </li>
</template>

<script>
import * as filterManager from '../../../services/filterManager'
import { mapGetters } from 'vuex'

export default {
  name: 'HistoryFilterIteam',
  props: {
    index: String,
    collection: String,
    filter: Object,
    favoris: Array
  },
  data() {
    return {
      expanded: false,
      oldName: this.filter.name
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['wrapper'])
  },
  methods: {
    IsFavori() {
      let idIndex = this.favoris
        .map(favori => {
          return favori.id
        })
        .indexOf(this.filter.id)
      if (idIndex !== -1) {
        return true
      } else {
        return false
      }
    },
    cancelChange() {
      this.filter.name = this.oldName
    },
    favorisUpdate() {
      if (this.IsFavori()) {
        let idIndex = this.favoris
          .map(favori => {
            return favori.id
          })
          .indexOf(this.filter.id)
        this.favoris.splice(idIndex, 1)
      } else {
        this.favoris.push(this.filter)
      }
    },
    SubmitChange() {
      this.favorisUpdate()
    },
    OpenModal() {
      this.$bvModal.show('changeNameHistoryFilter-' + this.filter.id)
    },
    deleteFilter() {
      this.$emit('filters-delete', this.filter.id)
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
