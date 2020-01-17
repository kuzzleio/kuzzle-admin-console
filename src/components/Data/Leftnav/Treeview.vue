<template>
  <aside class="sidenav h-100">
    <b-nav vertical>
      <b-nav-item v-if="!canSearchIndex()">
        <i class="fa fa-lock" aria-hidden="true" />
        <em>You are not allowed to list indexes</em>
      </b-nav-item>
      <b-nav-item v-else>
        <div class="">
          <b-form-input
            type="search"
            v-model="filter"
            placeholder="Search index &amp; collection"
          ></b-form-input>
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
  background-color: #ffffff;
  transform: translateX(0%) !important;
}
</style>
