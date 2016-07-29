<template>
  <nav class="subnav">
    <ul>
      <li :class="{'active': $route.params.index}">
        <a href="#!"
           v-link="{name: 'DataIndexes'}">
          <i class="fa fa-globe" aria-hidden="true"></i>
          Indexes
        </a>
      </li>

      <li :class="{'active': $route.params.collection, 'active in': isRouteActive($route, 'DataCreateCollection')}"
          v-if="$route.params.index">
        <a href="#!" v-link="{name: 'DataIndexSummary', params: {index: $route.params.index}}">
          <i class="fa fa-database" aria-hidden="true"></i>
          {{$route.params.index}}
        </a>
      </li>

      <li class="link link-active"
          v-if="isRouteActive($route, 'DataCreateCollection')">
        <a href="#!"
           v-link="{name: 'DataCreateCollection', params: {index: $route.params.index}}">
          Create new collection
        </a>
      </li>

      <li v-link-active
          v-if="$route.params.collection">
        <a href="#!"
           v-link="{name: 'DataCollectionBrowse', activeClass: 'in active', params: {index: $route.params.index, collection: $route.params.collection}}">
          <i class="fa fa-th-list" aria-hidden="true"></i>
          {{$route.params.collection}}
        </a>
      </li>

      <li class="link"
          :class="{'link-active': isRouteActive($route, 'DataCollectionBrowse')}"
          v-if="$route.params.collection">
        <a href="#!"
           v-link="{name: 'DataCollectionBrowse', params: {index: $route.params.index, collection: $route.params.collection}}">
          Browse
        </a>
      </li>

      <li class="link"
          :class="{'link-active': isRouteActive($route, 'DataCollectionWatch')}"
          v-if="$route.params.collection">
        <a href="#!" v-link="{name: 'DataCollectionWatch', params: {index: $route.params.index, collection: $route.params.collection}}">
          Watch
        </a>
      </li>

      <li class="link"
          :class="{'link-active': isRouteActive($route, 'DataCollectionSummary')}"
          v-if="$route.params.collection">
        <a href="#!"
           v-link="{name: 'DataCollectionSummary', params: {index: $route.params.index, collection: $route.params.collection}}">
          Summary
        </a>
      </li>
    </ul>
  </nav>

</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  nav {
    i {
      height: auto;
      margin-right: 3px;
    }
  }
  li {
    &.active {
      background-color: #e6e6e6
    }
    &.link {
      a:hover {
        background-color: transparent;
        box-shadow: inset 0px -4px 0px 0px rgba(0,0,0,0.25)
      }
    }
    &.link-active {
      a {
        box-shadow: inset 0px -4px 0px 0px rgba(0,0,0,0.15)
      }
    }
    &.in {
      & + li {
        a {
          padding-left: 25px;
        }
      }
      position: relative;
      &:after {
        content: ' ';
        position: absolute;
        right: -15px;
        top: 10px;
        width: 0;
        height: 0;
        border-top: 15px solid transparent;
        border-bottom: 15px solid transparent;
        border-left: 15px solid #e6e6e6;
      }
    }
  }
  .subnav {
    position: fixed;
    z-index: 100;
    top: 50px;
  }
</style>

<script>
  export default {
    name: 'DataBreadcrumb',
    methods: {
      isRouteActive (routeObject, routeName) {
        if (Array.isArray(routeName)) {
          return routeName.indexOf(routeObject.name) >= 0
        }

        return routeObject.name === routeName
      }
    }
  }
</script>
