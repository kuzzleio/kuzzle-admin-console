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
          <b-button variant="link" :title="'Edit Filter'" @click="openModal">
            <i class="fa fa-pencil-alt" />
          </b-button>
          <b-button
            variant="link"
            :title="'Favorite Filters'"
            :data-cy="'FilterHistoryItem-Add-Favorite--' + id"
            @click="toggleFavorite"
          >
            <i
              :class="isFavorite() === true ? 'fa fa-star' : 'far fa-star'"
              aria-hidden="true"
            />
          </b-button>
        </b-col>
        <b-col cols="2">
          <div class="float-right">
            <b-button
              variant="link"
              title="Use Filter"
              :data-cy="'FilterHistoryItem-Search-Favorite--' + id"
              @click="useFilter"
            >
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
      title="Edit favorite filter name"
      @ok="submitChange"
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
  name: 'FilterHistoryItem',
  props: {
    index: String,
    collection: String,
    filter: Object,
    favorite: Array,
    id: Number
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
    isFavorite() {
      const idIndex = this.favorite
        .map(f => {
          return f.id
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
    toggleFavorite() {
      this.$emit('toggle-favorite', !this.isFavorite())
    },
    submitChange() {
      this.$emit('change')
    },
    openModal() {
      this.$bvModal.show('changeNameHistoryFilter-' + this.filter.id)
    },
    deleteFilter() {
      this.$emit('filters-delete', this.filter.id)
    },
    useFilter() {
      this.$parent.$emit('submit', this.filter)
    },
    getFilter() {
      const loadedFilter = Object.assign(
        new filterManager.Filter(),
        this.filter
      )
      if (loadedFilter.active == 'basic') return loadedFilter.basic
      if (loadedFilter.active == 'raw') return loadedFilter.raw
    },
    toggleCollapse() {
      this.expanded = !this.expanded
    }
  }
}
</script>
