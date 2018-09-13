<template>
  <form class="Mapping wrapper" @submit.prevent="next">
    <!-- Required fields -->
    <div v-if="!$route.params.collection">
      <div class="row">
        <!-- Collection name -->
        <div class="col s6">
          <div class="input-field">
            <input id="collection-name" type="text" name="collection" required
                   class="validate" tabindex="1" :value="$store.state.collection.name" @input="setName" v-focus />
            <label for="collection-name">Collection name</label>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="divider"></div>
      </div>
    </div>

    <!-- Settings (mappings, realtime only ...) -->
    <div class="row">
      <div class="col s12">
        <div class="row">
          <p>
            <input
              type="checkbox"
              class="filled-in"
              tabindex="3"
              id="realtime-collection"
              :checked="collectionIsRealtimeOnly"
              @change="setRealtimeOnly"/>
            <label for="realtime-collection">
              Real-time only
            </label>
          </p>
        </div>
      </div>


      <div class="col s8" v-show="!collectionIsRealtimeOnly">
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

      <div class="col s4" v-show="!collectionIsRealtimeOnly">
        <div class="row">
          <p class="help">
            Mapping is the process of defining how a document,
            and the fields it contains, are stored and indexed.
            <a href="http://docs.kuzzle.io/api-documentation/controller-collection/update-mapping/" target="_blank">Read more about mapping</a>
            <br>
            You should omit the root "properties" field in this form.
            <pre>
{
  "age": { "type": "integer" },
  "name": { "type": "text" }
}
            </pre>
          </p>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="divider"></div>
    </div>

    <!-- Actions -->
    <div class="row">
      <div class="col s12">
        <a tabindex="6" class="btn-flat waves-effect" @click.prevent="cancel">Cancel</a>
        <button type="submit" class="btn primary waves-effect waves-light">
          {{collectionIsRealtimeOnly ? 'Save' : 'Next' }}
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import JsonEditor from '../../../Common/JsonEditor'
import {
  SET_MAPPING,
  SET_REALTIME_ONLY,
  SET_COLLECTION_NAME
} from '../../../../vuex/modules/collection/mutation-types'
import focus from '../../../../directives/focus.directive'

export default {
  name: 'Mapping',
  components: {
    JsonEditor
  },
  directives: {
    focus
  },
  props: {
    step: Number
  },
  data() {
    return {
      isRealtimeOnly: false,
      settingsOpen: false
    }
  },
  methods: {
    setName(e) {
      this.$store.commit(SET_COLLECTION_NAME, e.target.value.trim())
    },
    next() {
      if (!this.$store.state.collection.name) {
        return this.$emit('collection-create::error', 'Invalid collection name')
      }
      if (this.collectionIsRealtimeOnly) {
        this.$emit('collection-create::create')
      } else {
        this.$emit('collection-create::next-step')
      }
    },
    cancel() {
      this.$emit('cancel')
    },
    setRealtimeOnly(event) {
      this.$store.commit(SET_REALTIME_ONLY, event.target.checked)
    }
  },
  computed: {
    collectionIsRealtimeOnly() {
      return this.$store.getters.isRealtimeOnly
    }
  },
  watch: {
    step() {
      let mapping = this.$refs.jsoneditor.getJson()
      if (mapping) {
        this.$store.commit(SET_MAPPING, mapping)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.Mapping {
  .help {
    color: #777;
    font-size: 0.9rem;
  }
  .pre_ace {
    min-height: 500px;
  }
}
</style>
