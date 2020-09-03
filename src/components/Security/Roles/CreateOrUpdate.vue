<template>
  <b-container
    class="CreateOrUpdateRole d-flex flex-column h-100"
    data-cy="CreateOrUpdateRole"
  >
    <Headline v-if="id">
      Update role - <span class="code">{{ id }}</span>
    </Headline>
    <Headline v-else>
      Create a new role
    </Headline>
    <Notice />
    <template v-if="loading"></template>
    <template v-else>
      <b-card class="h-100">
        <b-row class="h-100">
          <b-col lg="7" md="12" class="d-flex flex-column">
            <b-form-group
              v-if="!id"
              data-cy="RoleCreateOrUpdate-id"
              label="Role ID"
              label-cols="3"
              :description="!id ? 'This field is mandatory' : ''"
            >
              <template v-slot:invalid-feedback id="profile-id-feedback">
                <span v-if="!$v.idValue.required"
                  >This field cannot be empty</span
                >
                <span v-else-if="!$v.idValue.isNotWhitespace"
                  >This field cannot contain just whitespaces</span
                >
                <span v-else-if="!$v.idValue.startsWithLetter"
                  >This field cannot start with a whitespace</span
                >
              </template>
              <b-input
                v-model="$v.idValue.$model"
                :disabled="id"
                :state="validateState('idValue')"
              ></b-input>
            </b-form-group>
            <b-form-group
              v-else
              label="Role ID"
              label-cols="3"
              :description="!id ? 'This field is mandatory' : ''"
            >
              <b-input :disabled="true" :value="id"></b-input>
            </b-form-group>
            <json-editor
              class="CreateOrUpdateRole-jsonEditor"
              data-cy="RoleCreateOrUpdate-jsonEditor"
              ref="jsoneditor"
              :content="documentValue"
              @change="onContentChange"
            />
          </b-col>
          <b-col lg="5" md="12" class="d-flex flex-column">
            <div class="CreateOrUpdateRole-cheatsheet">
              <h3>Cheatsheet</h3>
              Your role consists of a <code>controllers</code> object, in which
              each key represents a controller in your Kuzzle. Each contoller
              key contains an <code>actions</code> object, in which each key
              represents a valid action within that controller. Whitelist your
              actions by setting their value to <code>true</code> to allow them
              in the role, like the example below:
              <pre class="my-3 ml-3">
{
  "controllers": {
    "document": {
      "actions": {
        "get": true,
        "search": true
      }
    }
  }
}
            </pre
              >
            </div>
          </b-col>
        </b-row>

        <template v-slot:footer>
          <div class="text-right">
            <b-button @click="cancel">Cancel</b-button>
            <b-button
              v-if="!id"
              class="ml-2"
              data-cy="RoleCreateOrUpdate-createBtn"
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
              data-cy="RoleCreateOrUpdate-updateBtn"
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
  </b-container>
</template>

<style lang="scss" scoped>
.CreateOrUpdateRole {
  &-jsonEditor {
    flex-grow: 1;
  }

  &-cheatsheet {
    flex: 1 1 1px;
    overflow: auto;
  }
}
</style>

<script>
import { validationMixin } from 'vuelidate'
import { requiredUnless, not } from 'vuelidate/lib/validators'
import { startsWithSpace, isWhitespace } from '../../../validators'

import Headline from '../../Materialize/Headline'
import Notice from '../Common/Notice'
import JsonEditor from '../../Common/JsonEditor'
import omit from 'lodash/omit'
import { mapGetters } from 'vuex'

export default {
  mixins: [validationMixin],
  name: 'CreateOrUpdateRole',
  components: {
    Headline,
    JsonEditor,
    Notice
  },
  props: {
    id: {
      type: String
    }
  },
  data() {
    return {
      documentValue: '{}',
      idValue: null,
      loading: false,
      submitting: false
    }
  },
  validations: {
    idValue: {
      required: requiredUnless('id'),
      isNotWhitespace: not(isWhitespace),
      startsWithLetter: not(startsWithSpace)
    },
    documentValue: {
      syntaxOK: function(value) {
        try {
          JSON.parse(value)
        } catch (e) {
          return false
        }
        return true
      }
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['$kuzzle'])
  },
  methods: {
    validateState(fieldName) {
      const { $dirty, $error } = this.$v[fieldName]
      return $dirty ? !$error : null
    },
    onContentChange(value) {
      this.$v.documentValue.$model = value
    },
    async submit() {
      this.$v.$touch()
      if (this.$v.$anyError) {
        return
      }

      this.submitting = true

      try {
        await this.$kuzzle.security.createOrReplaceRole(
          this.idValue,
          JSON.parse(this.documentValue),
          {
            refresh: 'wait_for'
          }
        )
        this.$router.push({ name: 'SecurityRolesList' })
      } catch (e) {
        this.$log.error(e)
        this.$bvToast.toast('The complete error has been printed to console', {
          title: 'Ooops! Something went wrong while submitting the role',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
        this.submitting = false
      }
    },
    cancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.push(this.$router._prevTransition.to)
      } else {
        this.$router.push({ name: 'SecurityRolesList' })
      }
    }
  },
  async mounted() {
    if (!this.id) {
      return
    }
    try {
      this.loading = true
      const fetchedRole = await this.$kuzzle.security.getRole(this.id)
      this.idValue = fetchedRole._id
      const role = omit(fetchedRole, ['_id', '_kuzzle'])
      this.documentValue = JSON.stringify(role, null, 2)
    } catch (e) {
      this.$log.error(e)
      this.$bvToast.toast('The complete error has been printed to console', {
        title: 'Ooops! Something went wrong while fetching the role',
        variant: 'warning',
        toaster: 'b-toaster-bottom-right',
        appendToast: true,
        dismissible: true,
        noAutoHide: true
      })
    }
    this.loading = false
  }
}
</script>
