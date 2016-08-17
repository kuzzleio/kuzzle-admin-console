<template>
  <div class="wrapper">
    <headline title="Indexes - Browse"></headline>

    <div class="row">
      <div class="col s12 m10 l8">

      <div class="row actions">
        <div class="col s9">
          <a class="btn waves-effect waves-light primary" @click.prevent="$broadcast('modal-open', 'index-create')">
            <i class="fa fa-plus-circle left"></i>
            <span>Create</span>
          </a>
        </div>

          <!-- filter must be hidden when there is no indexes -->
          <div class="col s3">
            <div class="input-field left-align">
              <label for="filter"><i class="fa fa-search"></i> Filter</label>
              <input id="filter" v-model="filter" type="text" tabindex="1">
            </div>
          </div>
        </div>

        <div class="row">
          <!-- No index view -->
          <div class="col s12" v-if="!indexesAndCollections">
            <a class="card-title"
             href="#!"
             @click.prevent="$broadcast('modal-open', 'index-create')">
              <div class="card-panel hoverable">
                <div class="card-content">
                    There are no indexes yet. You may want to create a new one ?
                </div>
              </div>
            </a>
          </div>

          <!-- Index listing -->
          <index-boxed
            :index="index.name"
            v-if="!filter || index.name.indexOf(filter) >= 0"
            v-for="index in indexesAndCollections | orderBy 'name'">
          </index-boxed>

          <modal-create id="index-create"></modal-create>
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
  import Headline from '../../Materialize/Headline.vue'
  import ModalCreate from './ModalCreate'
  import IndexBoxed from './Boxed.vue'

  export default {
    name: 'IndexesList',
    components: {
      Headline,
      ModalCreate,
      IndexBoxed
    },
    data () {
      return {
        filter: ''
      }
    },
    ready () {
      this.listIndexesAndCollections()
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
