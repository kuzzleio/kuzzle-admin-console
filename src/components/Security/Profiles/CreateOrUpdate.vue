<template>
  <b-card class="ProfileCreateOrUpdate">
    <!-- Json view -->
    <b-row class="h-100">
      <b-col lg="7" md="12" class="ProfileCreateOrUpdate-editorLayout">
        <b-form-group
          v-if="!id"
          label="Profile ID"
          label-cols="3"
          :description="!id ? 'This field is mandatory' : ''"
        >
          <b-input
            v-model="idValue"
            data-cy="ProfileCreateOrUpdate-id"
            :disabled="id"
            :state="idState"
          ></b-input>
        </b-form-group>
        <b-form-group
          v-else
          label="Profile ID"
          label-cols="3"
          :description="!id ? 'This field is mandatory' : ''"
        >
          <b-input :disabled="true" :value="id"></b-input>
        </b-form-group>

        <json-editor
          class="ProfileCreateOrUpdate-jsonEditor"
          data-cy="ProfileCreateOrUpdate-jsonEditor"
          ref="jsoneditor"
          :content="profile"
          @change="onContentChange"
        />
      </b-col>

      <!-- Mapping -->
      <b-col lg="5" md="12" class="ProfileCreateOrUpdate-cheatsheetLayout">
        <h3>Cheatsheet</h3>
        <div class="ProfileCreateOrUpdate-cheatsheet">
          Your profile is a set of <code>policies</code>, each of which will
          contain a set of roles, like the example below:
          <pre class="my-3 ml-3">
{
  "policies": [{
      "roleId": "roleId"
    }]
}
        </pre
          >
          You can also restrict your policy to a set of indexes and collections,
          so that your roles will be valid to a specific subset of your data,
          like the example below:
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
        </pre
          >
        </div>
      </b-col>
    </b-row>

    <template v-slot:footer>
      <div class="text-right">
        <b-button @click="$emit('cancel')">Cancel</b-button>
        <b-button
          v-if="!id"
          class="ml-2"
          data-cy="ProfileCreateOrUpdate-createBtn"
          variant="primary"
          :disabled="submitting || !isJsonValid || !idState"
          @click="submit"
        >
          <i class="fa fa-plus-circle left" />
          Create
        </b-button>
        <b-button
          v-if="!!id"
          class="ml-2"
          data-cy="ProfileCreateOrUpdate-updateBtn"
          variant="primary"
          :disabled="submitting || !isJsonValid"
          @click="submit"
        >
          <i class="fa fa-pencil-alt left" />
          Update
        </b-button>
      </div>
    </template>
  </b-card>
</template>

<style lang="scss" scoped>
.ProfileCreateOrUpdate {
  // margin-bottom: 3em;
  flex-grow: 1;

  &-editorLayout,
  &-cheatsheetLayout {
    display: flex;
    flex-direction: column;
  }
  &-jsonEditor {
    flex-grow: 1;
  }
  &-cheatsheet {
    flex: 1 1 1px;
    margin-bottom: 0;
    overflow: auto;
  }
}
</style>

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
