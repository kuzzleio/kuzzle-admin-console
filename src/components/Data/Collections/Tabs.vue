<template>
  <div class="nav CollectionTabs">
    <ul class="pl-0">
      <li
        v-if="!$store.state.collection.isRealtimeOnly"
        :class="{ active: isRouteActive('DataDocumentsList') }"
      >
        <router-link
          class="CollectionTabs--browse"
          :to="{
            name: 'DataDocumentsList',
            params: {
              index: $route.params.index,
              collection: $route.params.collection
            }
          }"
        >
          Browse
        </router-link>
      </li>
      <li :class="{ active: isRouteActive('DataCollectionWatch') }">
        <router-link
          href="#!"
          class="CollectionTabs--watch"
          :title="
            canSubscribe($route.params.index, $route.params.collection)
              ? ''
              : 'You are not allowed to subscribe to this collection'
          "
          :class="{
            disabled: !canSubscribe(
              $route.params.index,
              $route.params.collection
            )
          }"
          :to="
            canSubscribe($route.params.index, $route.params.collection)
              ? {
                  name: 'DataCollectionWatch',
                  params: {
                    index: $route.params.index,
                    collection: $route.params.collection
                  }
                }
              : ''
          "
        >
          Watch
        </router-link>
      </li>
      <li
        v-if="!$store.state.collection.isRealtimeOnly"
        :class="{ active: isRouteActive('DataCreateDocument') }"
      >
        <router-link
          class="CollectionTabs--createDocument"
          :title="
            canCreateDocument($route.params.index, $route.params.collection)
              ? ''
              : 'You are not allowed to create a document in this collection'
          "
          :class="{
            disabled: !canCreateDocument(
              $route.params.index,
              $route.params.collection
            )
          }"
          :to="
            canCreateDocument($route.params.index, $route.params.collection)
              ? {
                  name: 'DataCreateDocument',
                  params: {
                    index: $route.params.index,
                    collection: $route.params.collection
                  }
                }
              : ''
          "
        >
          Create a document
        </router-link>
      </li>
    </ul>
  </div>
</template>

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

<script>
import {
  canCreateDocument,
  canSubscribe
} from '../../../services/userAuthorization'

export default {
  name: 'CollectionTabs',
  methods: {
    isRouteActive(routeName) {
      if (Array.isArray(routeName)) {
        return routeName.indexOf(this.$route.name) >= 0
      }

      return this.$route.name === routeName
    },
    canCreateDocument,
    canSubscribe
  }
}
</script>
