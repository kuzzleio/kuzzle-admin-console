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
          Create a collection
        </a>
      </li>

      <li :class="{'in active': isRouteActive(['DataCreateDocument', 'DataCollectionBrowse', 'DataCollectionWatch', 'DataCollectionSummary'])}"
          v-if="collection">
        <a href="#!"
           v-link="{name: 'DataCollectionBrowse', params: {index: index, collection: collection}}">
          <i class="fa fa-th-list" aria-hidden="true"></i>
          {{collection}}
        </a>
      </li>

      <li class="link link-active"
          v-if="isRouteActive('DataCreateDocument')">
        <a href="#!"
           v-link="{name: 'DataCreateCollection', params: {index: index}}">
          Create a document
        </a>
      </li>

      <li class="link"
          :class="{'link-active': isRouteActive('DataCollectionBrowse')}"
          v-if="collection && !isCollectionRealtime() && !isRouteActive('DataCreateDocument')">
        <a href="#!"
           v-link="{name: 'DataCollectionBrowse', params: {index: index, collection: collection}}">
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
      </li>
    </ul>
  </nav>

</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  nav {
    font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
    i {
      height: auto;
      margin-right: 3px;
    }
    ul {
      a {
        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      }
    }
  }
  li {
    &.active {
      background-color: #ECECEC
    }
    &.link {
      a:hover {
        background-color: transparent;
        box-shadow: inset 0px -4px 0px 0px rgba(0,0,0,0.1)
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
          padding-left: 20px;
        }
      }
      position: relative;
      &:after {
        content: ' ';
        position: absolute;
        right: -10px;
        top: 10px;
        width: 0;
        height: 0;
        border-top: 10px solid transparent;
        border-bottom: 10px solid transparent;
        border-left: 10px solid #ECECEC;
      }
    }
  }

  .subnav {
    position: fixed;
    z-index: 300;
    top: 40px;
  }

  @media only screen and (min-width: 1201px) {
    .subnav {
      top: 50px;
    }
    li {
      &.in {
        & + li {
          a {
            padding-left: 25px;
          }
        }
        &:after {
          right: -15px;
          top: 10px;
          border-top: 15px solid transparent;
          border-bottom: 15px solid transparent;
          border-left: 15px solid #ECECEC;
        }
      }
    }
  }
</style>

<script>
  export default {
    name: 'DataBreadcrumb',
    props: {
      routeName: String,
      index: String,
      collection: String,
      tree: Array
    },
    methods: {
      isCollectionRealtime () {
        return this.tree.filter((index) => {
          return (index.name === this.index && index.collections.realtime.indexOf(this.collection) >= 0)
        }).length
      },
      isRouteActive (routeName) {
        if (Array.isArray(routeName)) {
          return routeName.indexOf(this.routeName) >= 0
        }

        return this.routeName === routeName
      }
    }
  }
</script>
