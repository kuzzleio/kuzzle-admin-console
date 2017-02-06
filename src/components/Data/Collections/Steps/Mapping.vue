<template>
  <form class="wrapper" @submit.prevent="next">
    <!-- Required fields -->
    <div v-if="!$store.state.route.params.collection">
      <div class="row valign-center">
        <!-- Collection name -->
        <div class="col s6">
          <div class="input-field">
            <input id="$store.state.route.params.collection" type="text" name="collection" required
                   class="validate" tabindex="1" v-model="name" :value="$store.state.route.params.collection" v-focus />
            <label for="$store.state.route.params.collection">Collection name</label>
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
    <div class="row deep-orange-text" v-show="!settingsOpen && !$store.state.route.params.collection">
      <p class="col s12">
        <i class="fa fa-exclamation-triangle " aria-hidden="true"></i>
        Settings allow you to define mappings which enable cool functionalities such as geo spacial researches.
        <a @click.prevent="settingsOpen = true">click here to show settings</a>
      </p>
    </div>

    <!-- Settings (mappings, realtime only ...) -->
    <div class="row" v-show="settingsOpen || $store.state.route.params.collection">
      <div class="col s12">
        <div class="row">
          <p>
            <input type="checkbox" class="filled-in" tabindex="3" id="realtime-collection" v-model="isRealtimeOnly" :checked="collectionIsRealtimeOnly" :disabled="$store.state.route.params.collection && !collectionIsRealtimeOnly"/>
            <label for="realtime-collection">
              Realtime only
              <span v-if="$store.state.route.params.collection && !collectionIsRealtimeOnly">(Your collection is already stored in persistent layer)</span>
            </label>
          </p>
        </div>
      </div>


      <div class="col s8" v-show="!isRealtimeOnly">
        <div class="row">
          <p>Mapping:</p>
          <json-editor
            id="collection"
            tabindex="4"
            ref="jsoneditor"
            myclass="pre_ace"
            :content="$store.state.collection.mapping">
          </json-editor>
        </div>
      </div>

      <div class="col s4" v-show="!isRealtimeOnly">
        <div class="row">
          <p class="help">
            Mapping is the process of defining how a document,
            and the fields it contains, are stored and indexed.
            <a href="http://docs.kuzzle.io/api-reference/#updatemapping" target="_blank">Read more about mapping</a>
          </p>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="divider"></div>
    </div>

    <!-- Actions -->
    <div class="row">
      <div class="col s5 m4 l4">
        <a tabindex="6" class="btn-flat waves-effect" @click.prevent="cancel">Cancel</a>
        <button type="submit" class="btn primary waves-effect waves-light">
          Next
        </button>
      </div>
    </div>
  </form>
</template>

<script>
  import JsonEditor from '../../../Common/JsonEditor'
  import {SET_EDITION_STEP} from '../../../../vuex/modules/collection/mutation-types'

  export default {
    name: 'Mapping',
    components: {
      JsonEditor
    },
    data () {
      return {
        name: null,
        isRealtimeOnly: false,
        settingsOpen: false
      }
    },
    methods: {
      next () {
        this.$store.commit(SET_EDITION_STEP, 2)
      },
      cancel () {
        this.$emit('cancel')
      }
    }
  }
</script>