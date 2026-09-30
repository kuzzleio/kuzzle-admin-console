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

<script setup lang="ts">
import { useRoute } from 'vue-router';

import { useStorageIndexStore } from '@/stores';

const route = useRoute();
const storageIndexStore = useStorageIndexStore();

function routeParam(name: string): string | undefined {
  const value = route.params[name];
  return typeof value === 'string' ? value : undefined;
}

function index() {
  const indexName = routeParam('indexName');
  return indexName ? storageIndexStore.getOneIndex(indexName) : undefined;
}

// `index` est une méthode et `isRealtime` aussi : les tester sans les
// appeler donnait toujours vrai, et la condition inversée sur
// `collectionName` renvoyait `false` dès qu'une collection était ouverte.
// Le fil d'Ariane d'une collection temps réel menait à ses documents
// (G-106).
function isCollectionRealtime(): boolean {
  const currentIndex = index();
  const collectionName = routeParam('collectionName');
  if (!currentIndex || !collectionName || currentIndex.collections == null) {
    return false;
  }

  // Ce que fait le getter `getOneCollection` du store, appelé sur l'index
  // lui-même.
  const collection = currentIndex.getOneCollection(collectionName);
  return collection ? collection.isRealtime() : false;
}

function isRouteActive(routeName: string | string[]): boolean {
  if (Array.isArray(routeName)) {
    return typeof route.name === 'string' && routeName.includes(route.name);
  }

  return route.name === routeName;
}
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
