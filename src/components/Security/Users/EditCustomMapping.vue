<template>
  <b-container
    class="EditUserMapping d-flex flex-column h-100"
    data-cy="EditUserMapping"
  >
    <b-row>
      <b-col cols="6">
        <headline>Edit User Custom Data Mapping</headline>
      </b-col>
      <b-col>
        <b-button
          class="float-right"
          data-cy="export-user-mapping"
          :download="`${this.currentEnvironment.name}-user-mapping.json`"
          :href="downloadMappingValue"
          :disabled="!isMappingValid"
        >
          Export Mapping
        </b-button>
        <b-form-file
          class="float-right mr-3 w-50"
          ref="file-input"
          @change="loadMappingValue($event)"
          placeholder="Import mapping"
        />
      </b-col>
    </b-row>
    <b-alert class="flow-text" show>
      Here, you will be able to define the fields to be included in Users'
      custom data payload.
    </b-alert>
    <template v-if="!loading">
      <b-card class="flex-grow" body-class="h-100">
        <b-row class="h-100">
          <b-col cols="8">
            <json-editor
              id="user-custom-data-mapping-editor"
              data-cy="EditUserMapping-JSONEditor"
              myclass="h-100"
              ref="jsoneditor"
              tabindex="4"
              :content="mappingValue"
              @change="onMappingChange"
            />
          </b-col>
          <b-col class="text-secondary">
            Mapping is the process of defining how a document, and the fields it
            contains, are stored and indexed.
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
    </template>
  </b-container>
</template>

<script type="text/javascript">
/**
 * This feature is currently freezed.
 */

import Headline from '../../Materialize/Headline'
import JsonEditor from '../../Common/JsonEditor'
import omit from 'lodash/omit'
import { mapGetters } from 'vuex'
export default {
  name: 'UsersCustomMappingWizard',
  components: {
    Headline,
    JsonEditor
  },
  data() {
    return {
      mappingValue: '{}',
      loading: false,
      error: ''
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['wrapper', 'currentEnvironment']),
    isMappingValid() {
      try {
        JSON.parse(this.mappingValue)
        return true
      } catch (error) {
        return false
      }
    },
    downloadMappingValue() {
      if (this.isMappingValid) {
        const blob = new Blob([JSON.stringify(JSON.parse(this.mappingValue))], {
          type: 'application/json'
        })
        return window.URL.createObjectURL(blob)
      }
      return null
    }
  },
  async mounted() {
    this.loading = true
    const result = await this.wrapper.getMappingUsers()
    this.mappingValue = JSON.stringify(
      omit(result.mapping, 'profileIds') || {},
      null,
      2
    )
    this.loading = false
  },
  methods: {
    loadMappingValue(event) {
      let file = event.target.files[0]
      let reader = new FileReader()
      reader.onload = async e => {
        this.mappingValue = e.target.result
        this.$refs.jsoneditor.setContent(this.mappingValue)
        this.$bvToast.toast(
          'The file has been written in the json editor. You can still edit it before saving if necessary.',
          {
            title: 'Import successfully',
            variant: 'success',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true
          }
        )
      }
      reader.readAsText(file)
    },
    onMappingChange(value) {
      this.mappingValue = value
    },
    onCancel() {
      this.$router.push({ name: 'SecurityUsersList' })
    },
    async onSubmit() {
      try {
        await this.wrapper.updateMappingUsers(JSON.parse(this.mappingValue))
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
