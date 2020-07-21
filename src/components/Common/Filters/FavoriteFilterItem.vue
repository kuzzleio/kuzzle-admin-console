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
            >{{ favorite.name }}</a
          >
          <b-button variant="link" :title="'Edit Filter'" @click="openModal">
            <i class="fa fa-pencil-alt" />
          </b-button>
        </b-col>
        <b-col cols="2">
          <div class="float-right">
            <b-button variant="link" @click="useFilter" :title="'Edit Filter'">
              <i class="fa fa-search" />
            </b-button>
            <b-button
              variant="link"
              @click="deleteFavori"
              :title="'Delete Favori'"
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
      :id="`changeNameHistoryFilter-${favorite.id}`"
      title="you want to change this favorite name ?"
      @cancel="cancelChange"
      @close="cancelChange"
    >
      <b-input v-model="favorite.name" type="text" required />
    </b-modal>
  </li>
</template>

<script>
import * as filterManager from '../../../services/filterManager'
import { mapGetters } from 'vuex'

export default {
  name: 'FavoriteFilterItem',
  props: {
    index: String,
    collection: String,
    favorite: Object
  },
  data() {
    return {
      expanded: false,
      oldName: this.favorite.name,
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['wrapper'])
  },
  methods: {
    cancelChange() {
      this.favorite.name = this.oldName
    },
    openModal() {
      this.$bvModal.show('changeNameHistoryFilter-' + this.favorite.id)
    },
    deleteFavori() {
      this.$emit('favoris-delete', this.favorite.id)
    },
    useFilter() {
      if (this.favorite.active == 'raw') {
        this.$parent.$emit('filter-raw-submitted', this.favorite.raw, true)
      }
      if (this.favorite.active == 'basic') {
        this.$parent.$emit(
          'filter-basic-submitted',
          this.favorite.basic,
          this.favorite.sorting,
          true
        )
      }
    },
    getFilter() {
      let loadedFilter = Object.assign(new filterManager.Filter(), this.favorite)
      if (loadedFilter.active == 'basic') return loadedFilter.basic
      if (loadedFilter.active == 'raw') return loadedFilter.raw
    },
    toggleCollapse() {
      this.expanded = !this.expanded
    }
  }
}
</script>
