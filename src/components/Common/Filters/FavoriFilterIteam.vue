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
            >{{ favori.name }}</a
          >
          <b-button variant="link" :title="'Edit Filter'" @click="OpenModal">
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
      :id="`changeNameHistoryFilter-${favori.id}`"
      title="you want to change this favori name ?"
      @cancel="cancelChange"
      @close="cancelChange"
    >
      <b-input v-model="favori.name" type="text" required />
    </b-modal>
  </li>
</template>

<script>
import * as filterManager from '../../../services/filterManager'
import { mapGetters } from 'vuex'

export default {
  name: 'FavoriFilterIteam',
  props: {
    index: String,
    collection: String,
    favori: Object
  },
  data() {
    return {
      expanded: false,
      oldName: this.favori.name,
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['wrapper'])
  },
  methods: {
    cancelChange() {
      this.favori.name = this.oldName
    },
    OpenModal() {
      this.$bvModal.show('changeNameHistoryFilter-' + this.favori.id)
    },
    deleteFavori() {
      this.$emit('favoris-delete', this.favori.id)
    },
    useFilter() {
      if (this.favori.active == 'raw') {
        this.$parent.$emit('filter-raw-submitted', this.favori.raw, true)
      }
      if (this.favori.active == 'basic') {
        this.$parent.$emit(
          'filter-basic-submitted',
          this.favori.basic,
          this.favori.sorting,
          true
        )
      }
    },
    getFilter() {
      let loadedFilter = Object.assign(new filterManager.Filter(), this.favori)
      if (loadedFilter.active == 'basic') return loadedFilter.basic
      if (loadedFilter.active == 'raw') return loadedFilter.raw
    },
    toggleCollapse() {
      this.expanded = !this.expanded
    }
  }
}
</script>
