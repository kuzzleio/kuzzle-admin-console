<template>
  <b-container data-cy="EditUserMapping">
    <headline>Edit User Custom Data Mapping</headline>

    <div v-if="!loading" class="wrapper collection-edit">
      <b-alert class="flow-text">
        Here, you will be able to define the fields to be included in Users'
        custom data payload.
      </b-alert>
      <b-card class="card">
        <div class="card-panel card-body">
          <b-row>
            <b-col cols="8">
              <json-editor
                id="user-custom-data-mapping-editor"
                data-cy="EditUserMapping-JSONEditor"
                myclass="pre_ace"
                ref="jsoneditor"
                tabindex="4"
                :content="mappingValue"
                :height="350"
                @change="onMappingChange"
              />
            </b-col>
            <b-col>
              Mapping is the process of defining how a document, and the fields
              it contains, are stored and indexed.
              <a
                href="https://docs.kuzzle.io/api/1/controller-collection/update-mapping/"
                target="_blank"
                >Read more about mapping</a
              >
              <br />
              You should omit the root "properties" field in this form.
              <pre>
{
  "age": { "type": "integer" },
  "name": { "type": "string" }
}
          </pre
              >
            </b-col>
          </b-row>
        </div>

        <template v-slot:footer>
          <div class="text-right">
            <b-button class="mr-2" variant="outline-primary" @click="onCancel"
              >Cancel</b-button
            >
            <b-button
              data-cy="EditUserMapping-submitBtn"
              type="submit"
              variant="primary"
              :disabled="!isMappingValid"
              @click="onSubmit"
            >
              Save
            </b-button>
          </div>
        </template>
      </b-card>
    </div>
  </b-container>
</template>

<style lang="scss" scoped>
.ErrorBox {
  color: #fff;
  padding: 10px;

  p {
    margin: 0;
  }

  .ErrorBox-dismissBtn {
    float: right;
  }
}
</style>

<script type="text/javascript">
/**
 * This feature is currently freezed.
 */

import Headline from '../../Materialize/Headline'
import JsonEditor from '../../Common/JsonEditor'
import {
  getMappingUsers,
  updateMappingUsers
} from '../../../services/kuzzleWrapper'
import { omit } from 'lodash'

export default {
  name: 'UsersCustomMappingWizard',
  components: {
    Headline,
    JsonEditor
    // Mapping
  },
  data() {
    return {
      mappingValue: '{}',
      loading: false,
      error: ''
    }
  },
  computed: {
    isMappingValid() {
      if (!this.mappingValue) {
        return true
      }
      try {
        JSON.parse(this.mappingValue)
        return true
      } catch (error) {
        return false
      }
    }
  },
  async mounted() {
    this.loading = true
    const result = await getMappingUsers()
    this.mappingValue = JSON.stringify(
      omit(result.mapping, 'profileIds') || {},
      null,
      2
    )
    this.loading = false
  },
  methods: {
    onMappingChange(value) {
      this.mappingValue = value
    },
    onCancel() {
      this.$router.push({ name: 'SecurityUsersList' })
    },
    async onSubmit() {
      try {
        await updateMappingUsers(JSON.parse(this.mappingValue))
        this.$router.push({ name: 'SecurityUsersList' })
      } catch (error) {
        this.$log.error(error)
        this.$bvToast.toast('The complete error has been printed to console', {
          title: 'Ooops! Something went wrong while updating the mapping',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
      }
    }
  }
}
</script>
