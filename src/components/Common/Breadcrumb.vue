<template>
  <div class="nav-breadcrumb">
    <ul v-if="$route.path.indexOf('/security') === 0">
      <li>
        <router-link :to="{ name: 'Security' }">
          security
        </router-link>
      </li>

      <li v-if="isRouteActive('SecurityUsersList')">
        <i class="fa fa-angle-right separator" aria-hidden="true" />

        <router-link :to="{ name: 'SecurityUsersList' }">
          users
        </router-link>
      </li>

      <li v-if="isRouteActive('SecurityProfilesList')">
        <i class="fa fa-angle-right separator" aria-hidden="true" />

        <router-link :to="{ name: 'SecurityProfilesList' }">
          profiles
        </router-link>
      </li>

      <li v-if="isRouteActive('SecurityRolesList')">
        <i class="fa fa-angle-right separator" aria-hidden="true" />

        <router-link :to="{ name: 'SecurityRolesList' }">
          roles
        </router-link>
      </li>
    </ul>
    <ul v-if="$route.path.indexOf('/data') === 0">
      <li>
        <router-link :to="{ name: 'Data' }">
          data
        </router-link>
      </li>

      <li v-if="$route.params.index">
        <i class="fa fa-angle-right separator" aria-hidden="true" />

        <router-link
          :to="{
            name: 'DataIndexSummary',
            params: { index: $route.params.index }
          }"
        >
          {{ $route.params.index }}
        </router-link>
      </li>

      <li v-if="$route.params.collection">
        <i class="fa fa-angle-right separator" aria-hidden="true" />

        <router-link
          v-if="isCollectionRealtime()"
          :to="{
            name: 'DataCollectionWatch',
            params: {
              index: $route.params.index,
              collection: $route.params.collection
            }
          }"
        >
          {{ $route.params.collection }}
        </router-link>

        <router-link
          v-else
          :to="{
            name: 'DataDocumentsList',
            params: {
              index: $route.params.index,
              collection: $route.params.collection
            }
          }"
        >
          {{ $route.params.collection }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
.nav-breadcrumb {
  margin-bottom: 1.68rem;
  padding-left: 2px;
  i {
    height: auto;
    margin-right: 3px;
  }
  ul {
    color: #aaa;
    padding: 0;
    margin: 0;
    .separator {
      margin-left: 3px;
    }
    li {
      display: inline-block;
    }
    a {
      color: #aaa;
      &:hover {
        color: #444;
      }
    }
  }
}
</style>

<script>
import { canSearchIndex } from '../../services/userAuthorization'
export default {
  name: 'CommonBreadcrumb',
  methods: {
    canSearchIndex,
    isCollectionRealtime() {
      if (
        !this.$store.state.index.indexesAndCollections[this.$route.params.index]
      ) {
        return false
      }

      return (
        // prettier-ignore
        this.$store.state.index
          .indexesAndCollections[this.$route.params.index]
          .realtime
          .indexOf(this.$route.params.collection) !== -1
      )
    },
    isRouteActive(routeName) {
      if (Array.isArray(routeName)) {
        return routeName.indexOf(this.$route.name) >= 0
      }

      return this.$route.name === routeName
    }
  }
}
</script>
