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
                <input id="search" type="search" v-model="filter">
                <label for="search"><i class="fa fa-search"></i></label>
              </div>
            </form>
          </div>
        </nav>
      </li>
      <li>
        <ul class="indexes">
          <li
            v-for="(indexName, collections) in tree | orderBy '$key'"
            v-if="filterTree(indexName, collections)">
            <index-branch
              :force-open="indexesCount === 1"
              :index-name="indexName"
              :route-name="routeName"
              :collections="collections"
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

  export default {
    name: 'Treeview',
    props: {
      index: String,
      collection: String,
      routeName: String,
      tree: Object
    },
    components: {
      IndexBranch
    },
    data () {
      return {
        filter: ''
      }
    },
    computed: {
      indexesCount () {
        if (!this.indexesAndCollections) {
          return 0
        }

        return Object.keys(this.indexesAndCollections).length
      }
    },
    methods: {
      canSearchIndex,
      filterTree (indexName, collections) {
        if (this.filter === '' || indexName.indexOf(this.filter) >= 0) {
          return true
        }

        let stored = collections.stored.some(collection => collection.indexOf(this.filter) >= 0)
        let realtime = collections.realtime.some(collection => collection.indexOf(this.filter) >= 0)

        return (stored || realtime)
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
