<template>
  <div class="wrapper">
    <headline>Indexes - Browse</headline>

    <div class="row">
      <div class="col s12 m10 l8">

        <div class="row actions">
          <div class="col s9">
            <a class="btn btn-small waves-effect waves-light primary"
               v-title="{active: !canCreateIndex(), title: 'Your rights disallow you to create indexes'}"
               :class="{unauthorized: !canCreateIndex()}"
               @click.prevent="canCreateIndex() && $broadcast('modal-open', 'index-create')">
              <i class="fa fa-plus-circle left"></i>
              <span>Create</span>
            </a>
          </div>

          <!-- filter must be hidden when there is no indexes -->
          <div class="col s3">
            <div class="input-field left-align" v-if="indexesAndCollections.length > 1">
              <label for="filter"><i class="fa fa-search"></i> Filter</label>
              <input id="filter" v-model="filter" type="text" tabindex="1">
            </div>
          </div>
        </div>

        <div class="row">
          <!-- Not allowed -->
          <div class="col s12" v-if="!canSearchIndex()">
            <div class="card-panel unauthorized">
              <div class="card-content">
                <i class="fa fa-lock left " aria-hidden="true"></i>
                <em>You are not allowed to list indexes</em>
              </div>
            </div>
          </div>

          <!-- No index view -->
          <div class="col s12" v-if="canSearchIndex() && !indexesAndCollections.length">
            <a class="card-title fluid-hover"
             href="#!"
             @click.prevent="$broadcast('modal-open', 'index-create')">
              <div class="card-panel hoverable">
                <div class="card-content">
                    <em>There is no index yet. You may want to create a new one ?</em>
                </div>
              </div>
            </a>
          </div>

          <!-- Index listing -->
          <index-boxed
            :index="index.name"
            v-if="canSearchIndex() && (!filter || index.name.indexOf(filter) >= 0)"
            v-for="index in indexesAndCollections | orderBy 'name'">
          </index-boxed>

          <modal-create v-if="canCreateIndex" id="index-create"></modal-create>
        </div>

      </div>
    </div>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
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
  import {listIndexesAndCollections} from '../../../vuex/modules/data/actions'
  import {indexesAndCollections} from '../../../vuex/modules/data/getters'
  import {canSearchIndex, canCreateIndex} from '../../../services/userAuthorization'
  import Headline from '../../Materialize/Headline.vue'
  import ModalCreate from './ModalCreate'
  import IndexBoxed from './Boxed.vue'
  import Title from '../../../directives/title.directive'

  export default {
    name: 'IndexesList',
    components: {
      Headline,
      ModalCreate,
      IndexBoxed
    },
    directives: {
      Title
    },
    methods: {
      canSearchIndex,
      canCreateIndex
    },
    data () {
      return {
        filter: ''
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
        indexesAndCollections
      }
    }
  }
</script>
