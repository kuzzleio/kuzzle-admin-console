<template>
  <aside class="sidenav">
    <b-nav vertical class="w-25">
      <b-nav-item v-if="!canSearchIndex()">
        <i class="fa fa-lock" aria-hidden="true" />
        <em>You are not allowed to list indexes</em>
      </b-nav-item>
      <b-nav-item v-else>
        <div class="Treeview-searchField input-field">
          <input
            v-model="filter"
            type="search"
            placeholder="Search index &amp; collection"
          />
          <div class="Treeview-searchIcon">
            <i class="fa fa-search" />
          </div>
        </div>
      </b-nav-item>
      <b-nav-item v-for="indexName in orderedFilteredIndices" :key="indexName">
        <index-branch
          :index-name="indexName"
          :route-name="routeName"
          :collections="indexesAndCollections[indexName]"
          :current-index="index"
          :filter="filter"
          :current-collection="collection"
        />
      </b-nav-item>
    </b-nav>
    <!-- <aside class="Treeview"> -->
    <!-- <ul
        v-if="!canSearchIndex()"
        class="Treeview-container sidenav fixed leftside-navigation ps-container ps-active-y"
      >
        <li class="Treeview-unauthorized">
          <ul class="indexes">
            <li>
              <i class="fa fa-lock" aria-hidden="true" />
              <em>You are not allowed to list indexes</em>
            </li>
          </ul>
        </li>
      </ul> -->
    <!-- <ul
        v-else
        class="Treeview-container sidenav fixed leftside-navigation ps-container ps-active-y"
      >
        <li>
          <nav>
            <div class="nav-wrapper">
              <form>
                <div class="Treeview-searchField input-field">
                  <input
                    v-model="filter"
                    type="search"
                    placeholder="Search index &amp; collection"
                  />
                  <div class="Treeview-searchIcon">
                    <i class="fa fa-search" />
                  </div>
                </div>
              </form>
            </div>
          </nav>
        </li>
        <li>
          <ul class="Treeview-root">
            <li v-for="indexName in orderedFilteredIndices" :key="indexName">
              <index-branch
                :index-name="indexName"
                :route-name="routeName"
                :collections="indexesAndCollections[indexName]"
                :current-index="index"
                :filter="filter"
                :current-collection="collection"
              />
            </li>
          </ul>
        </li>
      </ul>-->
  </aside>
</template>

<script>
import { canSearchIndex } from '../../../services/userAuthorization'
import IndexBranch from './IndexBranch'
import { filterIndexesByKeyword } from '../../../services/data'

export default {
  name: 'Treeview',
  components: {
    IndexBranch
  },
  props: {
    index: String,
    collection: String,
    routeName: String
  },
  data() {
    return {
      filter: ''
    }
  },
  computed: {
    orderedFilteredIndices() {
      return [
        ...filterIndexesByKeyword(
          this.$store.state.index.indexes,
          this.$store.state.index.indexesAndCollections,
          this.filter
        )
      ].sort()
    },
    indexesAndCollections() {
      return Object.keys(this.$store.state.index.indexesAndCollections).length
        ? this.$store.state.index.indexesAndCollections
        : {}
    }
  },
  methods: {
    canSearchIndex
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
