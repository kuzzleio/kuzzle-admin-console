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

        let stored = indexTree.collections.stored.find(collection => {
          return collection.indexOf(filter) >= 0
        })
        let realtime = indexTree.collections.stored.find(collection => {
          return collection.indexOf(filter) >= 0
        })

        return (stored || realtime)
      }
    }
  }
</script>

<style scoped>
.indexes
{
  margin-top: 16px;
  padding-left: 15px;
  list-style: none;
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
}

li
{
  position: relative;
}
</style>
