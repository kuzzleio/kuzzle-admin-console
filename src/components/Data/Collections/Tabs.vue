<template>
  <div class="nav">
    <ul>
      <li :class="{active: isRouteActive('DataDocumentsList')}">
        <a href="#!" v-link="{name: 'DataDocumentsList', params: {index: selectedIndex, collection: selectedCollection}}">
          Browse
        </a>
      </li>
      <li :class="{active: isRouteActive('DataCollectionWatch')}">
        <a href="#!" v-link="{name: 'DataCollectionWatch', params: {index: selectedIndex, collection: selectedCollection}}">
          Watch
        </a>
      </li>
      <li :class="{active: isRouteActive('DataCreateDocument')}">
        <a v-if="canCreateDocument(selectedIndex, selectedCollection)"
          href="#!" v-link="{name: 'DataCreateDocument', params: {index: selectedIndex, collection: selectedCollection}}">
          Create a document
        </a>
        <a v-if="!canCreateDocument(selectedIndex, selectedCollection)"
           class="disabled"
           title="You are not allowed to create a document in this collection">
          Create a document
        </a>
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
        border-bottom: solid 2px #CCC;
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
  import { routeName, selectedIndex, selectedCollection } from '../../../vuex/modules/data/getters'
  import { canCreateDocument } from '../../../services/userAuthorization'

  export default {
    name: 'CollectionTabs',
    methods: {
      isRouteActive (routeName) {
        if (Array.isArray(routeName)) {
          return routeName.indexOf(this.routeName) >= 0
        }

        return this.routeName === routeName
      },
      canCreateDocument
    },
    vuex: {
      getters: {
        routeName,
        selectedIndex,
        selectedCollection
      }
    }
  }
</script>
