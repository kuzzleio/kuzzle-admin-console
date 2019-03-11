<template>
  <aside class="Treeview">
    <ul v-if="!canSearchIndex()" class="Treeview-container sidenav fixed leftside-navigation ps-container ps-active-y">
      <li class="Treeview-unauthorized">
        <ul class="indexes">
          <li>
            <i class="fa fa-lock" aria-hidden="true"></i>
            <em>You are not allowed to list indexes</em>
          </li>
        </ul>
      </li>
    </ul>
    <ul v-else class="Treeview-container sidenav fixed leftside-navigation ps-container ps-active-y">
      <li>
        <nav>
          <div class="nav-wrapper">
            <form>
              <div class="Treeview-searchField input-field">
                <input type="search" v-model="filter" placeholder="Search index &amp; collection">
                <div class="Treeview-searchIcon"><i class="fa fa-search"></i></div>
              </div>
            </form>
          </div>
        </nav>
      </li>
      <li>
        <ul class="Treeview-root">
          <li
            v-for="indexName in orderedFilteredIndices" :key="indexName">
            <index-branch
              :force-open="indexCount === 1"
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
import { canSearchIndex } from '../../../services/userAuthorization'
import IndexBranch from './IndexBranch'
import { filterIndexesByKeyword } from '../../../services/data'

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
  data() {
    return {
      filter: ''
    }
  },
  methods: {
    canSearchIndex
  },
  computed: {
    filteredIndices() {
      return [
        ...filterIndexesByKeyword(
          this.$store.state.index.indexes,
          this.$store.state.index.indexesAndCollections,
          this.filter
        )
      ]
    },
    orderedFilteredIndices() {
      return this.filteredIndices.sort()
    },
    indexesAndCollections() {
      return Object.keys(this.$store.state.index.indexesAndCollections).length
        ? this.$store.state.index.indexesAndCollections
        : {}
    },
    indexCount() {
      return Object.keys(this.indexesAndCollections).length
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.Treeview-container {
  z-index: 900;
  top: $navbar-height;
  height: 95%;
  width: $sidebar-width;

  @media (max-width: $medium-screen) {
    // @HACK this is nasty, but we need it to override the default
    // MaterializeCSS behavior, hiding the side menu whenever the
    // screen is less than medium-width.
    transform: translateX(0);
  }
}

.Treeview-searchField {
  height: 100%;
  background-color: #ffffff;
  color: #000000;

  .Treeview-searchIcon {
    position: absolute;
    top: 0;
    left: 20px;
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

.Treeview-unauthorized {
  li {
    line-height: 24px;
  }
}

.Treeview-root {
  margin-top: 16px;
  padding-left: 15px;
  list-style: none;
}

li {
  position: relative;
}

.sidenav {
    transform: translateX(0%) !important;
}
</style>
