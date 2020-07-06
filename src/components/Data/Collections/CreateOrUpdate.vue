<template>
  <div class="CollectionCreateOrUpdate">
    <headline>
      <span class="CollectionCreateOrUpdate-index code text-secondary">
        {{ index }}
        <i class="fa fa-angle-right" />
      </span>
      {{ headline }}
    </headline>

    <b-card class="flex-grow" body-class="CollectionCreateOrUpdate-form">
      <template v-slot:footer>
        <div class="text-right">
          <b-button
            class="mr-2"
            :to="{ name: 'Collections', params: { index } }"
            >Cancel</b-button
          >
          <b-button
            data-cy="CollectionCreateOrUpdate-submit"
            variant="primary"
            @click="onSubmit"
            >{{ submitLabel }}</b-button
          >
        </div>
      </template>
      <b-form-group
        id="collection-name"
        label="Collection name"
        label-for="collection-name-input"
        label-cols-sm="3"
        :state="nameInputState"
      >
        <template v-slot:description>
          <span v-if="collection">This field cannot be updated</span>
          <span v-else>This field is mandatory</span>
        </template>
        <template v-slot:invalid-feedback
          >The name you entered is invalid.
          <a
            target="_blank"
            href="https://docs.kuzzle.io/core/2/api/controllers/collection/create/"
            >Read more about how to choose a valid name</a
          >
        </template>
        <b-input
          data-cy="CollectionCreateOrUpdate-name"
          id="collection-name-input"
          type="text"
          name="collection"
          required
          tabindex="1"
          v-model="name"
          :disabled="!!collection"
          :state="nameInputState"
        />
      </b-form-group>

      <b-form-group
        id="collection-is-realtime"
        label="Collection is realtime only"
        label-cols-sm="3"
      >
        <template v-slot:description>
          <span v-if="collection">This field cannot be updated</span>
          <span v-else
            >Check this if you want this collection to be realtime only.
            Realtime collections are useful to subscribe to realtime messages
            and not physically stored into Kuzzle, only the Admin Console keeps
            track of them.</span
          >
        </template>
        <b-form-checkbox
          data-cy="CollectionCreateOrUpdate-realtimeOnly"
          id="collection-is-realtime-checkbox"
          tabindex="1"
          v-model="realtimeOnlyState"
          :disabled="!!collection"
        />
      </b-form-group>

      <template v-if="!realtimeOnlyState">
        <b-form-group label="Dynamic mapping" label-cols-sm="3">
          <template v-slot:description
            >Set the type of dynamic policy for this collection.
            <a
              target="_blank"
              href="https://docs.kuzzle.io/core/2/guides/essentials/database-mappings/#dynamic-mapping-policy"
              >Read more about Dynamic Mappings</a
            >.
          </template>
          <b-form-radio-group
            class="pt-2"
            v-model="dynamicState"
            :options="['true', 'false', 'strict']"
          ></b-form-radio-group>
        </b-form-group>
        <hr />
        <b-row class="flex-grow">
          <b-col cols="8">
            <json-editor
              id="collection"
              ref="jsoneditor"
              tabindex="4"
              myclass="CollectionCreateOrUpdate-jsonEditor"
              :content="rawMapping"
              @change="onMappingChanged"
            />
          </b-col>

          <b-col cols="4">
            <div
              class="CollectionCreateOrUpdate-helpLayout h-100 text-secondary"
            >
              <div class="CollectionCreateOrUpdate-help">
                You can (optionally) use this editor to define the mapping for
                this collection.
                <br />
                The mapping of a collection is the definition of how each
                document in the collection (and its fields) are stored and
                indexed.
                <a
                  href="https://docs.kuzzle.io/api/1/controller-collection/update-mapping/"
                  target="_blank"
                  >Read more about mapping</a
                >
                <br /><br />
                For example:
                <pre>
{
  "age": { "type": "integer" },
  "name": { "type": "text" }
}
              </pre
                >
              </div>
            </div>
          </b-col>
        </b-row>
      </template>
    </b-card>
  </div>
</template>

<style lang="scss" scoped>
.CollectionCreateOrUpdate {
  height: 100%;
  display: flex;
  flex-direction: column;

  &-form,
  &-helpLayout {
    display: flex;
    flex-direction: column;
  }

  &-jsonEditor {
    height: 100%;
  }

  &-help {
    flex: 1 1 1px;
    overflow: auto;
  }
}
</style>

<script>
import Headline from '../../Materialize/Headline'
import Focus from '../../../directives/focus.directive'
import JsonEditor from '../../Common/JsonEditor'

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
    index: { type: String, required: true },
    collection: String,
    headline: String,
    submitLabel: { type: String, default: 'OK' },
    realtimeOnly: Boolean,
    mapping: {
      type: Object,
      default: () => ({})
    },
    dynamic: { type: String, default: 'false' }
  },
  data() {
    return {
      dynamicState: this.dynamic || 'false',
      name: this.collection || '',
      rawMapping: '{}',
      realtimeOnlyState: this.realtimeOnly || false
    }
  },
  computed: {
    nameInputState() {
      if (this.name === '' || this.collection !== null) {
        return null
      }
      const containsDisallowed = /\\\\|\/|\*|\?|"|<|>|\||\s|,|#|:|%|&|\./.test(
        this.name
      )
      const containsUpperCase = /[A-Z]/.test(this.name)
      const isTooLong = new TextEncoder().encode(this.name).length > 128
      return !containsDisallowed && !containsUpperCase && !isTooLong
    },
    mappingState() {
      try {
        return JSON.parse(this.rawMapping)
      } catch (error) {
        return {}
      }
    },
    isMappingValid() {
      try {
        JSON.parse(this.rawMapping)
        return true
      } catch (error) {
        return false
      }
    }
  },
  methods: {
    onMappingChanged(value) {
      this.rawMapping = value
    },
    cancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.push(this.$router._prevTransition.to)
      } else {
        this.$router.push({
          name: 'Indexes',
          params: { index: this.index }
        })
      }
    },
    onSubmit() {
      if (this.isMappingValid) {
        if (this.name) {
          this.$emit('submit', {
            dynamic: this.dynamicState,
            name: this.name,
            mapping: this.mappingState,
            realtimeOnly: this.realtimeOnlyState
          })
        } else {
          this.$bvToast.toast('You must specify a collection name', {
            title: 'You cannot proceed',
            variant: 'info',
            toaster: 'b-toaster-bottom-right',
            appendToast: true
          })
        }
      } else {
        this.$bvToast.toast(
          'The JSON specification of the mapping contains syntax errors',
          {
            title: 'You cannot proceed',
            variant: 'info',
            toaster: 'b-toaster-bottom-right',
            appendToast: true
          }
        )
      }
    }
  },
  watch: {
    dynamic: {
      immediate: true,
      handler(v) {
        this.dynamicState = v
      }
    },
    mapping: {
      immediate: true,
      handler(val) {
        try {
          this.rawMapping = JSON.stringify(val, null, 2)
        } catch (error) {
          this.$log.error(error)
        }
      }
    },
    realtimeOnly: {
      immediate: true,
      handler(v) {
        this.realtimeOnlyState = v
      }
    },
    collection: {
      immediate: true,
      handler(v) {
        this.name = v
      }
    }
  }
}
</script>
