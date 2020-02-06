<template>
  <b-card class="Mapping">
    <template v-slot:footer>
      <div class="text-right">
        <b-button
          class="mr-2"
          :to="{ name: 'DataIndexSummary', params: { index } }"
          >Cancel</b-button
        >
        <b-button variant="primary" @click="onCreateClicked">Create</b-button>
      </div>
    </template>
    <b-form-group
      v-if="!$route.params.collection"
      id="collection-name"
      description="This field is mandatory"
      label="Collection name"
      label-for="collection-name-input"
      label-cols-sm="3"
      :state="nameInputState"
    >
      <template v-slot:invalid-feedback
        >The name you entered is invalid.
        <a
          target="_blank"
          href="https://docs.kuzzle.io/core/2/api/controllers/collection/create/"
          >Read more about how to choose a valid name</a
        >
      </template>
      <b-input
        id="collection-name-input"
        type="text"
        name="collection"
        required
        tabindex="1"
        v-model="name"
        :state="nameInputState"
      />
    </b-form-group>

    <b-form-group
      id="collection-is-realtime"
      description="Check this if you want this collection to be realtime only. Realtime collections are useful to subscribe to realtime messages and not physically stored into Kuzzle, only the Admin Console keeps track of them."
      label="Collection is realtime only"
      label-cols-sm="3"
    >
      <b-form-checkbox
        id="collection-is-realtime-checkbox"
        tabindex="1"
        v-model="realtimeOnly"
      />
    </b-form-group>

    <div v-show="!realtimeOnly">
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
          v-model="dynamic"
          :options="['true', 'false', 'strict']"
        ></b-form-radio-group>
      </b-form-group>
      <hr />
      <b-row>
        <b-col cols="8">
          <json-editor
            id="collection"
            ref="jsoneditor"
            tabindex="4"
            myclass="pre_ace"
            :content="mapping"
          />
        </b-col>

        <b-col cols="4">
          <div class="text-secondary">
            You can (optionally) use this editor to define the mapping for this
            collection.
            <br />
            The mapping of a collection is the definition of how each document
            in the collection (and its fields) are stored and indexed.
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
        </b-col>
      </b-row>
    </div>
  </b-card>
</template>

<script>
import JsonEditor from '../../../Common/JsonEditor'
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
    index: { type: String, required: true }
  },
  data() {
    return {
      dynamic: 'false',
      name: '',
      mapping: {},
      realtimeOnly: false
    }
  },
  computed: {
    nameInputState() {
      if (this.name === '') {
        return null
      }
      const containsDisallowed = /\\\\|\/|\*|\?|"|<|>|\||\s|,|#|:|%|&|\./.test(
        this.name
      )
      const containsUpperCase = /[A-Z]/.test(this.name)
      const isTooLong = new TextEncoder().encode(this.name).length > 128
      return !containsDisallowed && !containsUpperCase && !isTooLong
    }
  },
  watch: {},
  methods: {
    onCreateClicked() {
      let json = this.$refs.jsoneditor.getJson()

      if (json === null) {
        return
      }

      this.mapping = json

      this.$emit('create', {
        dynamic: this.dynamic,
        name: this.name,
        mapping: this.mapping,
        realtimeOnly: this.realtimeOnly
      })
    }
  }
}
</script>
