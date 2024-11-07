<template>
  <b-card class="ProfileCreateOrUpdate">
    <!-- Json view -->
    <b-row class="h-100">
      <b-col lg="7" md="12" class="d-flex flex-column">
        <b-form-group
          v-if="!id"
          data-cy="ProfileCreateOrUpdate-id"
          label="Profile ID"
          label-cols="3"
          label-for="profile-id"
          :description="!id ? 'This field is mandatory' : ''"
          :invalid-feedback="idFeedback"
        >
          <b-input
            id="profile-id"
            v-model="v$.idValue.$model"
            :disabled="id"
            :state="validateState('idValue')"
          />
        </b-form-group>
        <b-form-group
          v-else
          label="Profile ID"
          label-cols="3"
          :description="!id ? 'This field is mandatory' : ''"
        >
          <b-input :disabled="true" :value="id" />
        </b-form-group>

        <json-editor
          ref="jsoneditor"
          class="ProfileCreateOrUpdate-jsonEditor"
          data-cy="ProfileCreateOrUpdate-jsonEditor"
          :content="profile"
          @change="onContentChange"
        />
      </b-col>

      <!-- Mapping -->
      <b-col lg="5" md="12" class="d-flex flex-column">
        <h3>Cheatsheet</h3>
        <div class="ProfileCreateOrUpdate-cheatsheet">
          Your profile is a set of <code>policies</code>, each of which will contain a set of roles,
          like the example below:
          <pre class="my-3 ml-3">
{
  "policies": [{
      "roleId": "roleId"
    }]
}
        </pre
          >
          You can also restrict your policy to a set of indexes and collections, so that your roles
          will be valid to a specific subset of your data, like the example below:
          <pre class="my-3 ml-3">
{
  "policies": [{
      "roleId": "roleId"
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

    <template #footer>
      <div class="text-right">
        <b-button @click="$emit('cancel')">Cancel</b-button>
        <b-button
          v-if="!id"
          class="ml-2"
          data-cy="ProfileCreateOrUpdate-createBtn"
          variant="primary"
          :disabled="submitting"
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
          :disabled="submitting"
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
import { useVuelidate } from '@vuelidate/core';
import { not, requiredUnless, helpers } from '@vuelidate/validators';

import JsonFormatter from '@/directives/json-formatter.directive';
import { startsWithSpace, isWhitespace } from '@/validators';

import JsonEditor from '@/components/Common/JsonEditor.vue';

export default {
  name: 'ProfileCreateOrUpdate',
  components: {
    JsonEditor,
  },
  directives: {
    JsonFormatter,
  },
  props: {
    id: {
      type: String,
    },
    profile: {
      type: String,
      default: '{}',
    },
  },
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      profileValue: this.profile || '{}',
      idValue: null,
      submitting: false,
    };
  },
  validations() {
    return {
      idValue: {
        isNotWhitespace: helpers.withMessage(
          'This field cannot contain just whitespaces',
          not(isWhitespace),
        ),
        required: helpers.withMessage(
          'This field cannot be empty',
          requiredUnless(() => !!this.id),
        ),
        startsWithLetter: helpers.withMessage(
          'This field cannot start with a whitespace',
          not(startsWithSpace),
        ),
      },
      profileValue: {
        syntaxOK: function (value) {
          try {
            JSON.parse(value);
          } catch (e) {
            return false;
          }
          return true;
        },
      },
    };
  },
  computed: {
    idFeedback() {
      if (this.v$.idValue.$errors.length > 0) {
        return this.v$.idValue.$errors[0].$message;
      }

      return null;
    },
  },
  methods: {
    validateState(fieldName) {
      const { $dirty, $error } = this.v$[fieldName];
      return $dirty ? !$error : null;
    },
    onContentChange(value) {
      this.profileValue = value;
    },
    submit() {
      this.v$.$touch();
      if (this.v$.$errors.length > 0) {
        return;
      }
      this.$emit('submit', {
        profile: JSON.parse(this.profileValue),
        id: this.idValue,
      });
    },
    cancel() {
      this.$router.push({ name: 'SecurityProfilesList' });
    },
  },
};
</script>

<style lang="scss" scoped>
.ProfileCreateOrUpdate {
  flex-grow: 1;

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
