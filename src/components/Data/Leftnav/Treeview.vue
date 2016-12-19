<template>
  <aside>
    <ul v-if="!canSearchIndex()" class="side-nav fixed leftside-navigation ps-container ps-active-y">
      <li class="unauthorized">
        <ul class="indexes">
          <li>
            <i class="fa fa-lock" aria-hidden="true"></i>
            <em>You are not allowed to list indexes</em>
          </li>
        </ul>
      </li>
    </ul>
    <ul v-if="canSearchIndex()" class="side-nav fixed leftside-navigation ps-container ps-active-y">
      <li>
        <nav>
          <div class="nav-wrapper">
            <form>
              <div class="input-field">
                <input id="search" type="search" v-model="filter" placeholder="Search index &amp; collection">
                <label for="search"><i class="fa fa-search"></i></label>
              </div>
            </form>
          </div>
        </nav>
      </li>
      <li>
        <ul class="indexes">
          <li
            v-for="indexName in orderedFilteredIndices(filter)">
            <index-branch
              :force-open="indexesAndCollection.length === 1"
              :index-name="indexName"
              :route-name="routeName"
              :collections="indexesAndCollection"
              :current-index="index"
              :filter="filter"
              :current-collection="collection">
            </index-branch>
          </li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

<script>
  import {canSearchIndex} from '../../../services/userAuthorization'
  import IndexBranch from './IndexBranch'
  import {filterIndexesByKeyword} from '../../../services/data'
  import orderBy from 'lodash/orderBy'

  export default {
    name: 'Treeview',
    props: {
      index: String,
      collection: String,
      routeName: String
    },
    components: {
      IndexBranch
    },
    data () {
      return {
        filter: ''
      }
    },
    filters: {
      filterIndexes (indexes, filterInput) {
        return filterIndexesByKeyword(indexes, this.indexesAndCollections, filterInput)
      }
    },
    methods: {
      canSearchIndex,
      orderedFilteredIndices (order) {
        if (order) {
          return orderBy(this.filteredIndices, order)
        }
        return this.filteredIndices
      }
    },
    computed: {
      filteredIndices () {
        return this.$store.getters.indexes.filter(indexName => indexName.indexOf(this.filter) !== -1)
      },
      indexesAndCollection () {
        console.log('##', this.$store.state.data.indexesAndCollections)
        return Object.keys(this.$store.state.data.indexesAndCollections).length ? this.$store.state.data.indexesAndCollections : []
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .input-field {
    label {
      &.active i {
        color: #444
      }
    }
    input {
      padding-left: 3rem;

      &::-webkit-input-placeholder {
        font-size: 1rem;
      }
      &::-moz-placeholder {
        font-size: 1rem;
      }
      &:-ms-input-placeholder,
      &:-moz-placeholder {
        font-size: 1rem;
      }
    }
  }

  .unauthorized {
    li {
      line-height: 24px;
    }
  }

  .indexes {
    margin-top: 16px;
    padding-left: 15px;
    list-style: none;
  }

  li {
    position: relative;
  }
</style>
