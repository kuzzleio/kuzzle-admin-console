<template>
  <div class="nav-breadcrumb">
    <ul v-if="$route.path.indexOf('/security') === 0">
      <li>
        <a href="#!"
           v-link="{name: 'Security'}">
          security
        </a>
      </li>

      <li v-if="isRouteActive('SecurityUsersList')">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>

        <a href="#!" v-link="{name: 'SecurityUsersList'}">
          users
        </a>
      </li>

      <li v-if="isRouteActive('SecurityProfilesList')">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>

        <a href="#!" v-link="{name: 'SecurityProfilesList'}">
          profiles
        </a>
      </li>

      <li v-if="isRouteActive('SecurityRolesList')">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>

        <a href="#!" v-link="{name: 'SecurityRolesList'}">
          roles
        </a>
      </li>
    </ul>
    <ul v-if="$route.path.indexOf('/data') === 0">
      <li>
        <a href="#!"
           v-link="{name: 'Data'}">
          data
        </a>
      </li>

      <li v-if="selectedIndex">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>

        <a href="#!" v-link="{name: 'DataIndexSummary', params: {index: selectedIndex}}">
          {{selectedIndex}}
        </a>
      </li>

      <!--<li v-if="isRouteActive('DataCreateCollection')">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>
        <a href="#!"
           v-link="{name: 'DataCreateCollection', params: {index: selectedIndex}}">
          create a collection
        </a>
      </li>-->

      <li v-if="selectedCollection">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>

        <a href="#!"
           v-link="isCollectionRealtime() ? {name: 'DataCollectionWatch', params: {index: selectedIndex, collection: selectedCollection}} : {name: 'DataDocumentsList', params: {index: selectedIndex, collection: selectedCollection}}">
          {{selectedCollection}}
        </a>
      </li>

      <!--<li v-if="isRouteActive('DataCreateDocument')">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>
        <a href="#!"
           v-link="{name: 'DataCreateDocument', params: {index: selectedIndex, collection: selectedCollection}}">
          create a document
        </a>
      </li>-->

      <!--<li class="link"
          :class="{'link-active': isRouteActive('DataDocumentsList')}"
          v-if="collection && !isCollectionRealtime() && !isRouteActive('DataCreateDocument')">
        <a href="#!"
           v-link="{name: 'DataDocumentsList', params: {index: index, collection: collection}}">
          Browse
        </a>
      </li>
      <li class="link"
          :class="{'link-active': isRouteActive('DataCollectionWatch')}"
          v-if="collection && !isRouteActive('DataCreateDocument')">
        <a href="#!" v-link="{name: 'DataCollectionWatch', params: {index: index, collection: collection}}">
          Watch
        </a>
      </li>
      <li class="link"
          :class="{'link-active': isRouteActive('DataCollectionSummary')}"
          v-if="collection && !isRouteActive('DataCreateDocument')">
        <a href="#!"
           v-link="{name: 'DataCollectionSummary', params: {index: index, collection: collection}}">
          Summary
        </a>
      </li>-->
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
