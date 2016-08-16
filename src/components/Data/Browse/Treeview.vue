<template>
  <aside>
    <ul class="side-nav fixed leftside-navigation ps-container ps-active-y">
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
          <li v-for="(key, indexTree) in tree | orderBy 'name'" v-if="filterTree(filter, indexTree)">
            <index-branch
              :route-name="routeName"
              :index-tree="indexTree"
              :index="index"
              :filter="filter"
              :collection="collection">
            </index-branch>
          </li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

<script>
  import IndexBranch from './IndexBranch'

  export default {
    name: 'Treeview',
    props: {
      index: String,
      collection: String,
      routeName: String,
      tree: Array
    },
    components: {
      IndexBranch
    },
    data () {
      return {
        filter: ''
      }
    },
    methods: {
      filterTree (filter, indexTree) {
        if (filter === '' || indexTree.name.indexOf(filter) >= 0) {
          return true
        }

        let stored = indexTree.collections.stored.some(collection => collection.indexOf(filter) >= 0)
        let realtime = indexTree.collections.realtime.some(collection => collection.indexOf(filter) >= 0)

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

  .indexes {
    margin-top: 16px;
    padding-left: 15px;
    list-style: none;
  }

  li {
    position: relative;
  }
</style>
