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
            v-for="indexName in indexes | orderBy '$key' | filterIndexes filter">
            <index-branch
              :force-open="indexes.length === 1"
              :index-name="indexName"
              :route-name="routeName"
              :collections="indexesAndCollections[indexName]"
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
  import {indexes, indexesAndCollections} from '../../../vuex/modules/data/getters'
  import {canSearchIndex} from '../../../services/userAuthorization'
  import IndexBranch from './IndexBranch'

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
        let lowerCaseFilter = filterInput.toLowerCase()
        if (lowerCaseFilter === '') {
          return indexes
        }

        return indexes.filter((element) => {
          if (element.toLowerCase().indexOf(lowerCaseFilter) >= 0) {
            return true
          }

          let collections = this.indexesAndCollections[element]
          if (collections.stored.some(collection => collection.toLowerCase().indexOf(lowerCaseFilter) >= 0)) {
            return true
          }

          if (collections.realtime.some(collection => collection.toLowerCase().indexOf(lowerCaseFilter) >= 0)) {
            return true
          }
        })
      }
    },
    methods: {
      canSearchIndex
    },
    vuex: {
      getters: {
        indexes,
        indexesAndCollections
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
