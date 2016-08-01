<template>
  <nav class="subnav">
    <ul>
      <li :class="{'active': index}">
        <a href="#!"
           v-link="{name: 'DataIndexes'}">
          <i class="fa fa-globe" aria-hidden="true"></i>
          Indexes
        </a>
      </li>

      <li :class="{'active': collection, 'active in': isRouteActive('DataCreateCollection')}"
          v-if="index">
        <a href="#!" v-link="{name: 'DataIndexSummary', params: {index: index}}">
          <i class="fa fa-database" aria-hidden="true"></i>
          {{index}}
        </a>
      </li>

      <li class="link link-active"
          v-if="isRouteActive('DataCreateCollection')">
        <a href="#!"
           v-link="{name: 'DataCreateCollection', params: {index: index}}">
          Create new collection
        </a>
      </li>

      <li :class="{'in active': isRouteActive(['DataCollectionBrowse', 'DataCollectionWatch', 'DataCollectionSummary'])}"
          v-if="collection">
        <a href="#!"
           v-link="{name: 'DataCollectionBrowse', params: {index: index, collection: collection}}">
          <i class="fa fa-th-list" aria-hidden="true"></i>
          {{collection}}
        </a>
      </li>

      <li class="link"
          :class="{'link-active': isRouteActive('DataCollectionBrowse')}"
          v-if="collection">
        <a href="#!"
           v-link="{name: 'DataCollectionBrowse', params: {index: index, collection: collection}}">
          Browse
        </a>
      </li>

      <li class="link"
          :class="{'link-active': isRouteActive('DataCollectionWatch')}"
          v-if="collection">
        <a href="#!" v-link="{name: 'DataCollectionWatch', params: {index: index, collection: collection}}">
          Watch
        </a>
      </li>

      <li class="link"
          :class="{'link-active': isRouteActive('DataCollectionSummary')}"
          v-if="collection">
        <a href="#!"
           v-link="{name: 'DataCollectionSummary', params: {index: index, collection: collection}}">
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
    props: ['routeName', 'index', 'collection'],
    methods: {
      isRouteActive (routeName) {
        if (Array.isArray(routeName)) {
          return routeName.indexOf(this.routeName) >= 0
        }

        return this.routeName === routeName
      }
    }
  }
</script>
