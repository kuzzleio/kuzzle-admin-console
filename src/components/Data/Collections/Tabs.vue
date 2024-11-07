<template>
  <div class="nav CollectionTabs text-right">
    <ul class="pl-0">
      <li
        v-if="!$store.state.collection.isRealtimeOnly"
        :class="{ active: isRouteActive('DocumentList') }"
      >
        <router-link
          class="CollectionTabs--browse"
          :to="{
            name: 'DocumentList',
            params: {
              index: $route.params.index,
              collection: $route.params.collection,
            },
          }"
        >
          Browse
        </router-link>
      </li>
      <li :class="{ active: isRouteActive('WatchCollection') }">
        <router-link
          href="#!"
          class="CollectionTabs--watch"
          :title="
            canSubscribe($route.params.index, $route.params.collection)
              ? ''
              : 'You are not allowed to subscribe to this collection'
          "
          :class="{
            disabled: !canSubscribe($route.params.index, $route.params.collection),
          }"
          :to="
            canSubscribe($route.params.index, $route.params.collection)
              ? {
                  name: 'WatchCollection',
                  params: {
                    index: $route.params.index,
                    collection: $route.params.collection,
                  },
                }
              : ''
          "
        >
          Watch
        </router-link>
      </li>
      <li
        v-if="!$store.state.collection.isRealtimeOnly"
        :class="{ active: isRouteActive('CreateDocument') }"
      />
    </ul>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import { useAuthStore } from '@/stores';

export default {
  name: 'CollectionTabs',
  computed: {
    ...mapState(useAuthStore, ['canCreateDocument', 'canSubscribe']),
  },
  methods: {
    isRouteActive(routeName) {
      if (Array.isArray(routeName)) {
        return routeName.includes(this.$route.name);
      }

      return this.$route.name === routeName;
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.nav li {
  display: inline-block;
  a {
    padding: 10px 8px;
    text-transform: uppercase;
    color: #666;
    letter-spacing: 1px;
    margin: 0 10px;

    &:hover {
      border-bottom: solid 2px #ccc;
    }

    &.disabled {
      color: #9f9f9f;
    }
  }
  &.active {
    a {
      border-bottom: solid 2px #002835;
    }
  }
}
</style>
