<template>
  <div class="wrapper">
    <headline>
      {{index}} - Create a collection
    </headline>

    <div class="row">
      <div class="col s8">

        <form @submit.prevent="doCreateCollection">
          <!-- Required fields -->
          <div class="row">
            <!-- Collection name -->
            <div class="col s6">
                <div class="input-field">
                  <input id="collectionName" type="text" name="collection" required v-model="collectionName"
                         class="validate" tabindex="1" />
                  <label for="collectionName">Collection name</label>
                </div>
            </div>
            <!-- Toggle settings open -->
            <div class="col s6">
                <div class="input-field">
                  <button tabindex="2" type="submit" class="btn-flat waves-effect waves-light" @click.prevent="settingsOpen = !settingsOpen">
                    <i class="fa left" :class="settingsOpen ? 'fa-caret-down' : 'fa-caret-right'" aria-hidden="true"></i>
                    {{settingsOpen ? 'Hide settings' : 'Display settings'}}</button>
                </div>
            </div>
          </div>

          <div class="row">
            <div class="divider"></div>
          </div>

          <!-- Helper message about mapping -->
          <div class="row deep-orange-text" v-show="!settingsOpen">
            <p class="col s12">
              <i class="fa fa-exclamation-triangle " aria-hidden="true"></i>
              Settings allow you to define mappings which enable cool functionalities such as geo spacial researches.
              <a href="#!" @click.prevent="settingsOpen = true">click here to display settings</a>
            </p>
          </div>

          <!-- Settings (mappings, realtime only ...) -->
          <div class="row" v-show="settingsOpen">
            <div class="col s8">

              <div class="row">
                <p>
                  <input type="checkbox" class="filled-in" tabindex="3" id="realtime-collection" v-model="isRealTime"/>
                  <label for="realtime-collection">Realtime collection</label>
                </p>
              </div>

              <div class="row" v-show="!isRealTime">
                <p>Mapping:</p>
                <json-editor
                  tabindex="4"
                  v-ref:jsoneditor
                  class="pre_ace"
                  :content="{}">
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
                <button tabindex="5" type="submit" class="btn waves-effect waves-light">Create</button>
                <a tabindex="6" class="btn-flat waves-effect" @click.prevent="cancel">Cancel</a>
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
  import {createCollection} from '../../../vuex/modules/collection/actions'
  import JsonEditor from '../../Common/JsonEditor'

  export default {
    name: 'CollectionCreate',
    components: {
      Headline,
      JsonEditor
    },
    props: {
      index: String
    },
    data () {
      return {
        collectionName: null,
        settingsOpen: false,
        error: '',
        isRealTime: false
      }
    },
    methods: {
      cancel () {
        window.history.back()
      },
      doCreateCollection () {
        let mapping = this.$refs.jsoneditor.getJson()
        this.createCollection(this.index, this.collectionName, mapping, this.isRealTime).then(() => {
          this.$router.go({name: 'DataIndexSummary', params: {index: this.$route.params.index}})
        }).catch((e) => {
          this.error = e
        })
      }
    },
    vuex: {
      actions: {
        createCollection
      }
    }
  }
</script>
