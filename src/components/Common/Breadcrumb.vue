<template>
  <div class="nav-breadcrumb">
    <ul v-if="$route.path.indexOf('/security') === 0">
      <li>
        <router-link :to="{ name: 'Security' }">
          <i class="fa fa-home" />
          security
        </router-link>
      </li>

      <li
        v-if="
          isRouteActive([
            'SecurityUsersList',
            'SecurityUsersCreate',
            'SecurityUsersUpdate',
            'SecurityUsersEditCustomMapping',
          ])
        "
      >
        <i class="fa fa-angle-right separator" aria-hidden="true" />

        <router-link :to="{ name: 'SecurityUsersList' }"> users </router-link>
      </li>

      <li
        v-if="
          isRouteActive([
            'SecurityProfilesList',
            'SecurityProfilesCreate',
            'SecurityProfilesUpdate',
          ])
        "
      >
        <i class="fa fa-angle-right separator" aria-hidden="true" />

        <router-link :to="{ name: 'SecurityProfilesList' }"> profiles </router-link>
      </li>

      <li v-if="isRouteActive(['SecurityRolesList', 'SecurityRolesCreate', 'SecurityRolesUpdate'])">
        <i class="fa fa-angle-right separator" aria-hidden="true" />

        <router-link :to="{ name: 'SecurityRolesList' }"> roles </router-link>
      </li>
    </ul>
    <ul v-if="$route.path.indexOf('/data') === 0">
      <li>
        <router-link :to="{ name: 'Data' }">
          <i class="fa fa-home" />
          data
        </router-link>
      </li>

      <li v-if="$route.params.indexName">
        <i class="fa fa-angle-right separator" aria-hidden="true" />

        <router-link
          :to="{
            name: 'Collections',
            params: { indexName: $route.params.indexName },
          }"
        >
          {{ $route.params.indexName }}
        </router-link>
      </li>

      <li v-if="$route.params.collectionName">
        <i class="fa fa-angle-right separator" aria-hidden="true" />

        <router-link
          v-if="isCollectionRealtime()"
          :to="{
            name: 'WatchCollection',
            params: {
              indexName: $route.params.indexName,
              collectionName: $route.params.collectionName,
            },
          }"
        >
          {{ $route.params.collectionName }}
        </router-link>

        <router-link
          v-else
          :to="{
            name: 'DocumentList',
            params: {
              indexName: $route.params.indexName,
              collectionName: $route.params.collectionName,
            },
          }"
        >
          {{ $route.params.collectionName }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'CommonBreadcrumb',
  methods: {
    index() {
      return this.$route.params.indexName
        ? this.$store.direct.getters.index.getOneIndex(this.$route.params.indexName)
        : undefined;
    },
    isCollectionRealtime() {
      if (!this.index || this.$route.params.collectionName) {
        return false;
      }
      return this.$store.direct.getters.index.getOneCollection(
        this.index,
        this.$route.params.collectionName,
      ).isRealtime;
    },
    isRouteActive(routeName) {
      if (Array.isArray(routeName)) {
        return routeName.includes(this.$route.name);
      }

      return this.$route.name === routeName;
    },
  },
};
</script>

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
