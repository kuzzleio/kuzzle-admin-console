<template>
  <div class="IndexesPage wrapper w-75">
    <headline>
      Indexes - Browse
      <b-button
        class="float-right mt-3"
        v-if="canCreateIndex() && $store.state.index.indexes.length"
        variant="primary"
        @click.prevent="openModal"
      >
        <i class="fa fa-plus-circle left" />
        Create an index
      </b-button>
    </headline>

    <template v-if="canSearchIndex() && !$store.state.index.indexes.length">
      <b-card>
        <b-card-text>
          <b-container>
            <b-row align-v="center">
              <b-col lg="3" xl="2" class="d-none d-xl-block mr-1">
                <i
                  class="fa fa-8x fa-database text-secondary"
                  aria-hidden="true"
                />
              </b-col>
              <b-col>
                <h2>Here you'll see the kuzzle's indexes</h2>
                <p><em>Currently there is no index.</em></p>
                <b-button
                  v-if="canCreateIndex()"
                  variant="primary"
                  @click.prevent="openModal"
                >
                  <i class="fa fa-plus-circle left" />
                  Create an index
                </b-button>
              </b-col>
            </b-row>
          </b-container>
        </b-card-text>
      </b-card>
    </template>
    <template v-if="$store.state.index.indexes.length">
      <b-card>
        <b-card-text>
          <b-table
            sticky-header
            :items="tableItems"
            :fields="tableFields"
            :bordered="false"
          ></b-table>
        </b-card-text>
      </b-card>
    </template>
    <CreateIndexModal :id="createIndexModalId" @hide="onCreateIndexModalHide" />
  </div>
</template>

<script>
import Headline from '../../Materialize/Headline'
import CreateIndexModal from './CreateIndexModal'
import IndexBoxed from './Boxed'
import Title from '../../../directives/title.directive'
import {
  canCreateIndex,
  canSearchIndex
} from '../../../services/userAuthorization'

export default {
  name: 'IndexesList',
  components: {
    Headline,
    CreateIndexModal,
    IndexBoxed
  },
  directives: {
    Title
  },
  data() {
    return {
      createIndexModalId: 'createIndexModal',
      filter: '',
      isOpen: false,
      tableFields: ['name', 'collectionsNumber', 'actions']
    }
  },
  computed: {
    tableItems() {
      const tableItems = [],
        entries = Object.entries(this.$store.state.index.indexesAndCollections)

      for (const [key, el] of entries) {
        tableItems.push({
          name: key,
          collectionsNumber: el.realtime.length + el.stored.length
        })
      }
      return tableItems
    },
    orderedFilteredIndices() {
      return this.$store.state.index.indexes
        .filter(indexName => indexName.indexOf(this.filter) !== -1)
        .sort()
    }
  },
  methods: {
    canSearchIndex,
    canCreateIndex,
    openModal() {
      this.$bvModal.show(this.createIndexModalId)
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.wrapper {
  margin: 0 auto;
}
</style>
