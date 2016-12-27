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

      <li v-if="$store.state.route.params.index">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>

        <router-link :to="{name: 'DataIndexSummary', params: {index: $store.state.route.params.index}}">
          {{$store.state.route.params.index}}
        </router-link>
      </li>

      <li v-if="$store.state.route.params.collection">
        <i class="fa fa-angle-right separator" aria-hidden="true"></i>

        <router-link v-if="isCollectionRealtime()"
           :to="{name: 'DataCollectionWatch', params: {index: $store.state.route.params.index, collection: $store.state.route.params.collection}}">
          {{$store.state.route.params.collection}}
        </router-link>

        <router-link v-else
          :to="{name: 'DataDocumentsList', params: {index: $store.state.route.params.index, collection: $store.state.route.params.collection}}">
          {{$store.state.route.params.collection}}
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
  export default {
    name: 'CommonBreadcrumb',
    methods: {
      canSearchIndex,
      isCollectionRealtime () {
        if (!this.$store.state.data.indexesAndCollections[this.$store.state.route.params.index]) {
          return false
        }

        return this.$store.state.data.indexesAndCollections[this.$store.state.route.params.index].realtime.indexOf(this.$store.state.route.params.collection) !== -1
      },
      isRouteActive (routeName) {
        if (Array.isArray(routeName)) {
          return routeName.indexOf(this.$store.state.route.name) >= 0
        }

        return this.$store.state.route.name === routeName
      }
    }
  }
</script>
