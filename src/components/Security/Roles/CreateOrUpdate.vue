<template>
  <b-container class="mb-5" data-cy="CreateOrUpdateRole">
    <Headline v-if="id">
      Update role - <span class="code">{{ id }}</span>
    </Headline>
    <Headline v-else>
      Create a new role
    </Headline>
    <Notice />
    <template v-if="loading"></template>
    <template v-else>
      <b-card>
        <b-row>
          <b-col lg="7" md="12">
            <b-form-group
              v-if="!id"
              label="Role ID"
              label-cols="3"
              :description="!id ? 'This field is mandatory' : ''"
            >
              <b-input
                v-model="idValue"
                data-cy="RoleCreateOrUpdate-id"
                :disabled="id"
                :state="idState"
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
              class="document-json"
              data-cy="RoleCreateOrUpdate-jsonEditor"
              ref="jsoneditor"
              :content="documentValue"
              :height="500"
              @change="onContentChange"
            />
          </b-col>
          <b-col lg="5" md="12">
            <h3>Cheatsheet</h3>
            Your role consists of a <code>controllers</code> object, in which
            each key represents a controller in your Kuzzle. Each contoller key
            contains an <code>actions</code> object, in which each key
            represents a valid action within that controller. Whitelist your
            actions by setting their value to <code>true</code> to allow them in
            the role, like the example below:
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
            </pre>
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
              :disabled="submitting || !isJsonValid || !idState"
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
  </b-container>
</template>

<script>
import Headline from '../../Materialize/Headline'
import Notice from '../Common/Notice'
import { getMappingRoles } from '../../../services/kuzzleWrapper'
import JsonEditor from '../../Common/JsonEditor'
import trim from 'lodash/trim'

export default {
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
  computed: {
    idState() {
      if (!this.idValue || trim(this.idValue, ' ') === '') {
        return false
      }
      return true
    },
    isJsonValid() {
      try {
        JSON.parse(this.documentValue)
      } catch (e) {
        return false
      }
      return true
    }
  },
  methods: {
    getMappingRoles,
    onContentChange(value) {
      this.documentValue = value
    },
    async submit() {
      if (!this.idValue) {
        this.$bvToast.toast('Please provide a valid ID', {
          title: 'Cannot create role',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
        return
      }
      if (!this.documentValue) {
        this.$bvToast.toast('Please review it', {
          title: 'The document is invalid',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
        return
      }

      this.submitting = true

      try {
        if (!this.id) {
          await this.$kuzzle.security.createRole(
            this.idValue,
            JSON.parse(this.documentValue),
            {
              wait_for: 'refresh'
            }
          )
        } else {
          await this.$kuzzle.security.updateRole(
            this.idValue,
            JSON.parse(this.documentValue),
            {
              wait_for: 'refresh'
            }
          )
        }
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
      const role = await this.$kuzzle.security.getRole(this.id)
      this.idValue = role._id
      delete role._kuzzle
      delete role._id
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
