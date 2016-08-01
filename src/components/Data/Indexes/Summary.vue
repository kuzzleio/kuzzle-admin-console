<template>
  <div class="wrapper">
    <headline>
      {{$route.params.index}} - Summary
      <index-dropdown class="icon-medium icon-black" :id="$route.params.index"></index-dropdown>
    </headline>


    <div class="row">
      <div class="col s3">

        <div class="row">
          <div class="col s6">Total documents</div>
          <div class="col s6 right-align">1 567</div>
        </div>
        <div class="row">
          <div class="col s6">Index Size</div>
          <div class="col s6 right-align">64 mb</div>
        </div>
        <div class="row">
          <div class="col s5">Auto refresh</div>
          <div class="col s7 right-align">
            <div class="switch">
              <label>
                <input type="checkbox">
                <span class="lever"></span>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div class="row">
      <div class="col s8">

        <div class="row actions">
          <div class="col s9">
            <a class="btn waves-effect waves-light"
               href="#!"
               v-link="{name: 'DataCreateCollection', params: {index: $route.params.index}}">
              <i class="fa fa-plus-circle left"></i>Create a collection
            </a>
          </div>

          <!-- filter must be hidden when there is no indexes -->
          <div class="col s3">
            <div class="input-field left-align">
              <label for="filter"><i class="fa fa-search"></i> Filter</label>
              <input id="filter" type="text" tabindex="1" v-model="filter">
            </div>
          </div>
        </div>

        <div class="row">
          <!-- No collection view -->
          <div class="col s12" v-if="!hasCollection">
            <a  class="card-title" href="#">
              <div class="card-panel hoverable">
                <div class="card-content">
                  There is no collection in index <strong>{{$route.params.index}}</strong> yet. You may want to create a new one ?
                </div>
              </div>
            </a>
          </div>

          <collection-boxed
              v-for="collection in collections.stored | orderBy 1"
              v-if="!filter || (filter && collection.includes(filter))"
              :collection="collection"
              :is-realtime="false">
          </collection-boxed>

          <collection-boxed
              v-for="collection in collections.realtime | orderBy 1"
              v-if="!filter || (filter && collection.includes(filter))"
              :collection="collection"
              :is-realtime="true">
          </collection-boxed>

        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  .switch {
    label {
      .lever {
        margin: 0;
      }
    }
  }
  .actions {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .input-field {
    margin-top: 0;
    label {
      left: 0;
    }
    input {
      margin-bottom: 0;
    }
  }
</style>


<script>
  import Headline from '../../Materialize/Headline'
  import IndexDropdown from './Dropdown'
  import CollectionBoxed from '../Collections/Boxed'
  import {getCollectionsFromIndex} from '../../../vuex/modules/data/actions'
  import {collections} from '../../../vuex/modules/data/getters'

  export default {
    name: 'IndexesSummary',
    components: {
      Headline,
      CollectionBoxed,
      IndexDropdown
    },
    data () {
      return {
        filter: ''
      }
    },
    ready () {
      this.getCollectionsFromIndex(this.$route.params.index)
    },
    computed: {
      hasCollection () {
        return this.collections.realtime.length > 0 || this.collections.stored.length > 0
      }
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
