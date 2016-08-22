<template>
  <div class="wrapper">
    <headline>
      {{index}}
      <index-dropdown class="icon-medium icon-black" :index="index"></index-dropdown>
    </headline>


    <!--<div class="row">
      <div class="col s6 m4 l3">

        <div class="row">
          <div class="col s6 truncate">Total documents</div>
          <div class="col s6 right-align">1 567</div>
        </div>
        <div class="row">
          <div class="col s6 truncate">Index Size</div>
          <div class="col s6 right-align">64 mb</div>
        </div>
        <div class="row">
          <div class="col s5 truncate">Auto refresh</div>
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
    </div>-->

    <div class="row">
      <div class="col s12 m10 l8">

        <div class="row actions" v-if="countCollection">
          <div class="col s9">
            <a class="btn waves-effect waves-light primary"
               href="#!"
               v-title="{active: !canCreateCollection(index), title: 'Your rights disallow you to create collections on index ' + index}"
               :class="{unauthorized: !canCreateCollection(index)}"
               v-link="canCreateCollection(index) ? {name: 'DataCreateCollection', params: {index: index}} : {}">
              <i class="fa fa-plus-circle left"></i>Create a collection
            </a>
          </div>

          <!-- filter must be hidden when there is no indexes -->
          <div class="col s3">
            <div class="input-field left-align" v-if="countCollection > 1">
              <label for="filter"><i class="fa fa-search"></i> Filter</label>
              <input id="filter" type="text" tabindex="1" v-model="filter">
            </div>
          </div>
        </div>

        <div class="row">
          <!-- Not allowed -->
          <div class="card-panel" v-if="!canSearchCollection(index)">
            <div class="row valign-bottom empty-set empty-set-condensed">
              <div class="col s1 offset-s1">
                <i class="fa fa-6x fa-lock grey-text text-lighten-1" aria-hidden="true"></i>
              </div>
              <div class="col s10">
                <p>
                  You are not allowed to list collections in index <strong>{{index}}</strong><br>
                </p>
                <p>
                  <em>Learn more about security & permissions on <a href="http://kuzzle.io/guide/#permissions" target="_blank">http://kuzzle.io/guide</a></em>
                </p>
              </div>
            </div>
          </div>

          <div class="card-panel" v-if="canSearchCollection(index) && !countCollection">
            <div class="row valign-bottom empty-set empty-set-condensed">
              <div class="col s1 offset-s1">
                <i class="fa fa-6x fa-th-list grey-text text-lighten-1" aria-hidden="true"></i>
              </div>
              <div class="col s9">
                <p>
                  You will see <strong>{{index}}'s</strong> collections here<br/>
                  <em>For the time there is no one created yet</em>
                </p>
                <button v-link="{name: 'DataCreateCollection', params: {index: index}}"
                        v-title="{active: !canCreateCollection(index), title: 'Your rights disallow you to create collections on index ' + index}"
                        :class="{unauthorized: !canCreateCollection(index)}"
                        class="btn btn-small primary waves-effect waves-light">
                  <i class="fa fa-plus-circle left"></i>
                  Create a collection
                </button>
              </div>
            </div>
          </div>


          <collection-boxed
              v-for="collection in collections.stored | orderBy 1"
              v-if="canSearchCollection(index) && (!filter || (filter && collection.includes(filter)))"
              :index="index"
              :collection="collection"
              :is-realtime="false">
          </collection-boxed>

          <collection-boxed
              v-for="collection in collections.realtime | orderBy 1"
              v-if="canSearchCollection(index) && (!filter || (filter && collection.includes(filter)))"
              :index="index"
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
  import {canSearchCollection, canCreateCollection} from '../../../services/userAuthorization'
  import Title from '../../../directives/title.directive'

  export default {
    name: 'CollectionsList',
    props: {
      index: String
    },
    components: {
      Headline,
      CollectionBoxed,
      IndexDropdown
    },
    methods: {
      canSearchCollection,
      canCreateCollection
    },
    directives: {
      Title
    },
    data () {
      return {
        filter: ''
      }
    },
    watch: {
      'index': function (index) {
        if (this.canSearchCollection(index)) {
          this.getCollectionsFromIndex(index)
        }
      }
    },
    ready () {
      if (this.canSearchCollection(this.index)) {
        this.getCollectionsFromIndex(this.index)
      }
    },
    computed: {
      countCollection () {
        return this.collections.realtime.length + this.collections.stored.length
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
