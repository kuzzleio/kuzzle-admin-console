<template>
  <div class="IndexesPage wrapper">
    <headline>Indexes - Browse</headline>

    <div class="row">
      <div class="col s12 m10 l8">

        <!-- No index view -->
        <div class="card-panel" v-if="canSearchIndex() && !$store.state.index.indexes.length">
          <div class="row valign-bottom empty-set">
            <div class="col s1 offset-s1">
              <i class="fa fa-6x fa-database grey-text text-lighten-1" aria-hidden="true"></i>
            </div>
            <div class="col s9">
              <p>
                Here you'll see the kuzzle's indexes<br/>
                <em>Currently there is no index.</em>
              </p>
              <button @click.prevent="openModal"
                      v-if="canCreateIndex()"
                      class="IndexesPage-createBtn btn primary waves-effect waves-light">
                <i class="fa fa-plus-circle left"></i>
                Create an index
              </button>
            </div>
          </div>
        </div>

        <div class="row actions" v-if="$store.state.index.indexes.length">
          <div class="col s9">
            <button class="IndexesPage-createBtn btn waves-effect waves-light primary"
               v-title="{active: !canCreateIndex(), title: 'You are not allowed to create new indexes.'}"
               :class="{unauthorized: !canCreateIndex()}"
               @click.prevent="openModal">
              <i class="fa fa-plus-circle left"></i>
              <span>Create an index</span>
            </button>
          </div>

          <!-- filter must be hidden when there is no indexes -->
          <div class="col s3">
            <div class="input-field left-align" v-if="$store.state.index.indexes.length">
              <label for="filter"><i class="fa fa-search"></i> Filter</label>
              <input id="filter" v-model="filter" type="text" tabindex="1">
            </div>
          </div>
        </div>

        <div class="row list">
          <!-- Not allowed -->
          <div class="col s12" v-if="!canSearchIndex">
            <div class="card-panel unauthorized">
              <div class="card-content">
                <i class="fa fa-lock left " aria-hidden="true"></i>
                <em>You are not allowed to list indexes</em>
              </div>
            </div>
          </div>

          <!-- No index for filter -->
          <div class="card-panel card-body" v-if="!filteredIndices.length && filter">
            <div class="row valign-center empty-set">
              <div class="col s2 offset-s1">
                <i class="fa fa-6x fa-search grey-text text-lighten-1" aria-hidden="true"></i>
              </div>
              <div class="col s12">
                <p>
                  There is no index matching your filter.<br />
                  Please try with another one.
                </p>
              </div>
            </div>
          </div>

          <!-- Index listing -->
          <div v-if="canSearchIndex()">
            <index-boxed
              :index="indexName"
              v-for="(indexName, key) in orderedFilteredIndices"
              :key="key">
            </index-boxed>
          </div>
          <modal-create v-if="canCreateIndex()" id="index-create" :is-open="isOpen" :close="close"></modal-create>
        </div>

      </div>
    </div>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
.IndexesPage {
  .actions {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .input-field {
    margin-top: 0;
    label {
      left: 0;
    }
    input {
      margin-bottom: 0;
    }
  }
  .list {
    margin-top: 25px;
  }
}
</style>

<script>
import Headline from '../../Materialize/Headline'
import ModalCreate from './ModalCreate'
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
    ModalCreate,
    IndexBoxed
  },
  directives: {
    Title
  },
  methods: {
    canSearchIndex,
    canCreateIndex,
    openModal() {
      this.isOpen = true
    },
    close() {
      this.isOpen = false
    }
  },
  data() {
    return {
      filter: '',
      isOpen: false
    }
  },
  computed: {
    filteredIndices() {
      return this.$store.state.index.indexes.filter(
        indexName => indexName.indexOf(this.filter) !== -1
      )
    },
    orderedFilteredIndices() {
      return this.filteredIndices.sort()
    }
  }
}
</script>
