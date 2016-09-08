<template>
  <div class="wrapper">
    <headline>
      {{index}} - {{headline}}
    </headline>

    <div class="row">
      <div class="col s12 m10 l8 card">
        <form class="wrapper" @submit.prevent="create">
          <!-- Required fields -->
          <div v-if="!collectionName">
            <div class="row valign-center">
              <!-- Collection name -->
              <div class="col s6">
                <div class="input-field">
                  <input id="collectionName" type="text" name="collection" required
                         class="validate" tabindex="1" v-model="name" :value="collectionName" v-focus />
                  <label for="collectionName">Collection name</label>
                </div>
              </div>
              <!-- Toggle settings open -->
              <div class="col s6">
                <div class="input-field">
                  <a tabindex="2" type="submit" class="btn-flat waves-effect waves-light" @click.prevent="settingsOpen = !settingsOpen">
                    <i class="fa left" :class="settingsOpen ? 'fa-caret-down' : 'fa-caret-right'" aria-hidden="true"></i>
                    {{settingsOpen ? 'Hide settings' : 'Show settings'}}</a>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="divider"></div>
            </div>
          </div>

          <!-- Helper message about mapping -->
          <div class="row deep-orange-text" v-show="!settingsOpen && !collectionName">
            <p class="col s12">
              <i class="fa fa-exclamation-triangle " aria-hidden="true"></i>
              Settings allow you to define mappings which enable cool functionalities such as geo spacial researches.
              <a href="#!" @click.prevent="settingsOpen = true">click here to show settings</a>
            </p>
          </div>

          <!-- Settings (mappings, realtime only ...) -->
          <div class="row" v-show="settingsOpen || collectionName">
            <div class="col s12">
              <div class="row">
                <p>
                  <input type="checkbox" class="filled-in" tabindex="3" id="realtime-collection" v-model="isRealtimeOnly" :checked="collectionIsRealtimeOnly" :disabled="collectionName && !collectionIsRealtimeOnly"/>
                  <label for="realtime-collection">
                    Realtime only
                    <span v-if="collectionName && !collectionIsRealtimeOnly">(Your collection is already stored in persistent layer)</span>
                  </label>
                </p>
              </div>
            </div>


            <div class="col s8" v-show="!isRealtimeOnly">
              <div class="row">
                <p>Mapping:</p>
                <json-editor
                  tabindex="4"
                  v-ref:jsoneditor
                  class="pre_ace"
                  :content="mapping">
                </json-editor>
              </div>
            </div>

            <div class="col s4" v-show="!isRealtimeOnly">
              <div class="row">
                <p class="help">
                  Mapping is the process of defining how a document,
                  and the fields it contains, are stored and indexed.
                  <a href="http://kuzzle.io/api-reference/#updatemapping" target="_blank">Read more about mapping</a>
                </p>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="divider"></div>
          </div>

          <!-- Actions -->
          <div class="row">
            <div class="col s6">
                <a tabindex="6" class="btn-flat waves-effect" @click.prevent="cancel">Cancel</a>
                <button type="submit" class="btn primary waves-effect waves-light">
                  <i v-if="!collectionName" class="fa fa-plus-circle left"></i>
                  <i v-else class="fa fa-pencil left"></i>
                  {{collectionName ? 'Update' : 'Create'}}
                </button>
                <p class="error">{{error}}</p>
            </div>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  .help {
    color: #777;
    font-size: 0.9rem;
  }
  .pre_ace {
    min-height: 300px;
  }
  .error {
    color: #d54f58
  }
</style>

<script>
  import Headline from '../../Materialize/Headline'
  import JsonEditor from '../../Common/JsonEditor'
  import { resetCollectionDetail } from '../../../vuex/modules/collection/actions'
  import { mapping, collectionName, collectionIsRealtimeOnly } from '../../../vuex/modules/collection/getters'
  import Focus from '../../../directives/focus.directive'

  export default {
    name: 'CollectionCreateOrUpdate',
    components: {
      Headline,
      JsonEditor
    },
    directives: {
      Focus
    },
    props: {
      index: String,
      headline: String
    },
    vuex: {
      getters: {
        mapping,
        collectionName,
        collectionIsRealtimeOnly
      },
      actions: {
        resetCollectionDetail
      }
    },
    data () {
      return {
        error: '',
        name: null,
        isRealtimeOnly: false,
        settingsOpen: false
      }
    },
    watch: {
      'collectionIsRealtimeOnly' (value) {
        this.isRealtimeOnly = value
      }
    },
    methods: {
      create () {
        this.$dispatch('collection-create::create', this.name || this.collectionName, this.$refs.jsoneditor.getJson(), this.isRealtimeOnly)
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.go({name: 'DataIndexSummary', params: {index: this.index}})
        }
      }
    },
    beforeDestroy () {
      this.resetCollectionDetail()
    }
  }
</script>
