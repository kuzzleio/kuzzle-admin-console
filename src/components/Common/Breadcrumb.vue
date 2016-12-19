<template>
  <div class="nav-breadcrumb">
    <ul v-if="$route.path.indexOf('/security') === 0">
      <li>
        <router-link
           :to="{name: 'Security'}">
          security
        </router-link>
      </li>

      <li v-if="isRouteActive('SecurityUsersList')">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>

        <router-link :to="{name: 'SecurityUsersList'}">
          users
        </router-link>
      </li>

      <li v-if="isRouteActive('SecurityProfilesList')">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>

        <router-link :to="{name: 'SecurityProfilesList'}">
          profiles
        </router-link>
      </li>

      <li v-if="isRouteActive('SecurityRolesList')">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>

        <router-link :to="{name: 'SecurityRolesList'}">
          roles
        </router-link>
      </li>
    </ul>
    <ul v-if="$route.path.indexOf('/data') === 0">
      <li>
        <router-link
           :to="{name: 'Data'}">
          data
        </router-link>
      </li>

      <li v-if="selectedIndex">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>

        <router-link :to="{name: 'DataIndexSummary', params: {index: selectedIndex}}">
          {{selectedIndex}}
        </router-link>
      </li>

      <li v-if="selectedCollection">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>

        <router-link
           :to="{name: isCollectionRealtime() ? {name: 'DataCollectionWatch', params: {index: selectedIndex, collection: selectedCollection}} : {name: 'DataDocumentsList', params: {index: selectedIndex, collection: selectedCollection}}}">
          {{selectedCollection}}
        </router-link>
      </li>
    </ul>
  </div>

</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  .nav-breadcrumb {
    margin-bottom: 1.68rem;
    padding-left: 2px;
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
    i {
      height: auto;
      margin-right: 3px;
    }
    ul {
      color: #AAA;
      padding: 0;
      margin: 0;
      .separator {
        margin-left: 3px;
      }
      li {
        display: inline-block;
      }
      a {
        color: #AAA;
        &:hover {
          color: #444;
        }
      }
    }
  }
</style>

<script>
  import {canSearchIndex} from '../../services/userAuthorization'
  import {indexesAndCollections, routeName, selectedIndex, selectedCollection} from '../../vuex/modules/data/getters'
  export default {
    name: 'CommonBreadcrumb',
    methods: {
      canSearchIndex,
      isCollectionRealtime () {
        if (!this.indexesAndCollections[this.selectedIndex]) {
          return false
        }

        return this.indexesAndCollections[this.selectedIndex].realtime.indexOf(this.selectedCollection) !== -1
      },
      isRouteActive (routeName) {
        if (Array.isArray(routeName)) {
          return routeName.indexOf(this.routeName) >= 0
        }

        return this.routeName === routeName
      }
    },
    vuex: {
      getters: {
        routeName,
        selectedIndex,
        selectedCollection,
        indexesAndCollections
      }
    }
  }
</script>
