<template>
  <div class="nav-breadcrumb">
    <ul>
      <li :class="{'active': selectedIndex}">
        <a href="#!"
           v-link="{name: 'DataIndexes'}">
          Data
        </a>
      </li>

      <li :class="{'active': selectedCollection, 'active in': isRouteActive('DataCreateCollection')}"
          v-if="selectedIndex">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>

        <a href="#!" v-link="{name: 'DataIndexSummary', params: {index: selectedIndex}}">
          {{selectedIndex}}
        </a>
      </li>

      <li class="link link-active"
          v-if="isRouteActive('DataCreateCollection')">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>

        <a href="#!"
           v-link="{name: 'DataCreateCollection', params: {index: selectedIndex}}">
          Create a collection
        </a>
      </li>

      <li :class="{'in active': isRouteActive(['DataCreateDocument', 'DataCollectionBrowse', 'DataCollectionWatch', 'DataCollectionSummary'])}"
          v-if="selectedCollection">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>

        <a href="#!"
           v-link="isCollectionRealtime() ? {name: 'DataCollectionWatch', params: {index: selectedIndex, collection: selectedCollection}} : {name: 'DataCollectionBrowse', params: {index: selectedIndex, collection: selectedCollection}}">
          {{selectedCollection}}
        </a>
      </li>

      <li class="link link-active"
          v-if="isRouteActive('DataCreateDocument')">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>

        <a href="#!"
           v-link="{name: 'DataCreateCollection', params: {index: selectedIndex}}">
          Create a document
        </a>
      </li>

      <!--<li class="link"
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
      </li>-->
    </ul>
  </div>

</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  .nav-breadcrumb {
    margin-bottom: 1.68rem;
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
  import {canSearchIndex} from '../../services/userAuthorization'
  import {listIndexesAndCollections} from '../../vuex/modules/data/actions'
  import {indexesAndCollections, selectedIndex, selectedCollection} from '../../vuex/modules/data/getters'

  export default {
    name: 'DataBreadcrumb',
    props: {
      routeName: String
    },
    methods: {
      canSearchIndex,
      isCollectionRealtime () {
        return this.indexesAndCollections.filter((index) => {
          return (index.name === this.selectedIndex && index.collections.realtime.indexOf(this.selectedCollection) >= 0)
        }).length
      },
      isRouteActive (routeName) {
        if (Array.isArray(routeName)) {
          return routeName.indexOf(this.routeName) >= 0
        }

        return this.routeName === routeName
      }
    },
    ready () {
      if (this.canSearchIndex()) {
        this.listIndexesAndCollections()
      }
    },
    vuex: {
      actions: {
        listIndexesAndCollections
      },
      getters: {
        selectedIndex,
        selectedCollection,
        indexesAndCollections
      }
    }
  }
</script>
