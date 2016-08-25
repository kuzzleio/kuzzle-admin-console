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
                         class="validate" tabindex="1" v-model="name" :value="collectionName"/>
                  <label for="collectionName">Collection name</label>
                </div>
              </div>
              <!-- Toggle settings open -->
              <div class="col s6">
                <div class="input-field">
                  <button tabindex="2" type="submit" class="btn-flat waves-effect waves-light" @click.prevent="settingsOpen = !settingsOpen">
                    <i class="fa left" :class="settingsOpen ? 'fa-caret-down' : 'fa-caret-right'" aria-hidden="true"></i>
                    {{settingsOpen ? 'Hide settings' : 'Show settings'}}</button>
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
            <div class="col s8">

              <div class="row">
                <p>
                  <input type="checkbox" class="filled-in" tabindex="3" id="realtime-collection" v-model="isRealtimeOnly" :checked="collectionIsRealtimeOnly" :disabled="collectionName && !collectionIsRealtimeOnly"/>
                  <label for="realtime-collection">
                    Realtime only
                    <span v-if="collectionName && !collectionIsRealtimeOnly">(Your collection is already stored in persistent layer)</span>
                  </label>
                </p>
              </div>

              <div class="row" v-show="!isRealtimeOnly">
                <p>Mapping:</p>
                <json-editor
                  tabindex="4"
                  v-ref:jsoneditor
                  class="pre_ace"
                  :content="mapping">
                </json-editor>
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
                <button type="submit" class="btn waves-effect waves-light">
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

<style>
  .pre_ace {
    min-height: 300px;
  }
  .error {
    color: #d54f58
  }
</style>

<script>
  import Headline from '../../Materialize/Headline'
  import { resetCollectionDetail } from '../../../vuex/modules/collection/actions'
  import { mapping, collectionName, collectionIsRealtimeOnly } from '../../../vuex/modules/collection/getters'
  import JsonEditor from '../../Common/JsonEditor'

  export default {
    name: 'CollectionCreate',
    components: {
      Headline,
      JsonEditor
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
        this.$dispatch('collection-create::cancel')
      }
    },
    beforeDestroy () {
      this.resetCollectionDetail()
    }
  }
</script>
