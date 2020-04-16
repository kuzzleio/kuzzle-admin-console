<template>
  <b-card class="ProfileCreateOrUpdate">
    <!-- Json view -->
    <b-row>
      <b-col lg="7" md="12">
        <b-form-group
          label="Profile ID"
          label-cols="3"
          :description="!id ? 'This field is mandatory' : ''"
        >
          <b-input :disabled="id" v-model="idValue" :state="idState"></b-input>
        </b-form-group>
        <json-editor
          id="document"
          ref="jsoneditor"
          class="document-json"
          :content="profile"
          :height="500"
          @change="onContentChange"
        />
      </b-col>

      <!-- Mapping -->
      <b-col lg="5" md="12">
        <h3>Cheatsheet</h3>
        Your profile is a set of <code>policies</code>, each of which will
        contain a set of roles, like the example below:
        <pre class="my-3 ml-3">
{
  "policies": [{
      "roleId": "roleId"
    }]
}
        </pre>
        You can also restrict your policy to a set of indexes and collections,
        so that your roles will be valid to a specific subset of your data, like
        the example below:
        <pre class="my-3 ml-3">
{
  "policies": [{
      "roleIds": "roleId"
      "restrictedTo": {
        "index": "myindex",
        "collections": [
          "collection1",
          "collection2"...
        ]
      }
    }]
}
        </pre>
      </b-col>
    </b-row>

    <template v-slot:footer>
      <div class="text-right">
        <b-button @click="$emit('cancel')">Cancel</b-button>
        <b-button
          v-if="!id"
          class="ml-2"
          variant="primary"
          :disabled="submitting || !isJsonValid || !idState"
          @click="submit"
        >
          <i class="fa fa-plus-circle left" />
          Create
        </b-button>
        <b-button
          v-if="!!id"
          variant="primary"
          class="ml-2"
          data-cy="DocumentUpdate-btn"
          :disabled="submitting || !isJsonValid || !idState"
          @click="submit"
        >
          <i class="fa fa-pencil-alt left" />
          Update
        </b-button>
      </div>
    </template>
  </b-card>
</template>

<script>
import JsonEditor from '../../Common/JsonEditor'
import JsonFormatter from '../../../directives/json-formatter.directive'
import { trim } from 'lodash'

export default {
  name: 'ProfileCreateOrUpdate',
  components: {
    JsonEditor
  },
  directives: {
    JsonFormatter
  },
  props: {
    id: {
      type: String
    },
    profile: {
      type: String,
      default: '{}'
    }
  },
  data() {
    return {
      profileValue: '{}',
      idValue: null,
      submitting: false
    }
  },
  computed: {
    idState() {
      if (!this.idValue || trim(this.idValue, ' ') === '') {
        return false
      }
      return true
    },
    isJsonValid() {
      try {
        JSON.parse(this.profileValue)
      } catch (e) {
        return false
      }
      return true
    }
  },
  methods: {
    onContentChange(value) {
      this.profileValue = value
    },
    submit() {
      this.$emit('submit', {
        profile: JSON.parse(this.profileValue),
        id: this.idValue
      })
    },
    cancel() {
      this.$router.push({ name: 'SecurityProfilesList' })
    }
  }
}
</script>

<style lang="scss" scoped>
.ProfileCreateOrUpdate {
  margin-bottom: 3em;
}
</style>
