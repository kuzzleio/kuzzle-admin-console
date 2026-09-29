<template>
  <nav aria-label="Breadcrumb" class="nav-breadcrumb">
    <ul v-if="$route.path.indexOf('/security') === 0">
      <li>
        <router-link :to="{ name: 'Security' }">
          <i class="fa fa-home" aria-hidden="true" />
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
          <i class="fa fa-home" aria-hidden="true" />
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
  </nav>
</template>

<script>
import { useStorageIndexStore } from '@/stores';

export default {
  name: 'CommonBreadcrumb',
  setup() {
    return {
      storageIndexStore: useStorageIndexStore(),
    };
  },
  methods: {
    index() {
      return this.$route.params.indexName
        ? this.storageIndexStore.getOneIndex(this.$route.params.indexName)
        : undefined;
    },
    // `index` est une méthode et `isRealtime` aussi : les tester sans les
    // appeler donnait toujours vrai, et la condition inversée sur
    // `collectionName` renvoyait `false` dès qu'une collection était ouverte.
    // Le fil d'Ariane d'une collection temps réel menait à ses documents
    // (G-106).
    isCollectionRealtime() {
      const index = this.index();
      const collectionName = this.$route.params.collectionName;
      if (!index || !collectionName || index.collections == null) {
        return false;
      }

      const collection = this.storageIndexStore.getOneCollection(index, collectionName);
      return collection ? collection.isRealtime() : false;
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
    color: var(--muted-foreground);
    padding: 0;
    margin: 0;
    .separator {
      margin-left: 3px;
    }
    li {
      display: inline-block;
    }
    a {
      color: var(--muted-foreground);
      &:hover {
        color: var(--foreground);
      }
    }
  }
}
</style>
