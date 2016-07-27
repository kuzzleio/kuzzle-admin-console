<template>
  <div class="row">
    <div class="col s12">
      <p class="head">{{$route.params.index}} - Summary</p>
    </div>
  </div>
  <div class="row">
    <div class="col m12">
      <a v-link="{name: 'CreateCollection', params: {index: $route.params.index}}" class="btn"><i class="fa fa-plus-circle"></i> Add a collection</a>
    </div>
  </div>
  <div class="row">
    <!-- stored collecitons -->
    <div class="col s12 m3" v-for="collection in collections.stored">
      <div class="card">
        <div class="card-content">
          <span class="card-title">{{collection}}</span>
        </div>
        <div class="card-action">
          <a href="#"><i class="fa fa-plus-circle"> Create a document</i></a>
        </div>
      </div>
    </div>
    <!-- realtime collections -->
    <div class="col s12 m3" v-for="collection in collections.realtime">
      <div class="card">
        <div class="card-content">
          <span class="card-title">{{collection}}</span>
        </div>
        <div class="card-action">
          <a href="#"><i class="fa fa-plus-circle"> Create a document</i></a>
        </div>
      </div>
    </div>
  </div>
</template>

<style type="text/css" media="screen" scoped>
  .head {
    float: left;
    font-size: 2rem;
    margin-top: 0;
  }
</style>

<script>
  import {getCollectionsFromIndex} from '../../../vuex/modules/data/actions'
  import {collections} from '../../../vuex/modules/data/getters'

  export default {
    name: 'DataLayout',
    ready () {
      this.getCollectionsFromIndex(this.$route.params.index)
    },
    vuex: {
      actions: {
        getCollectionsFromIndex
      },
      getters: {
        collections
      }
    }
  }
</script>
