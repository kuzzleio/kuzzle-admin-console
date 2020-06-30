<template>
  <b-container data-cy="EditUserMapping">
    <b-row>
      <b-col cols="7">
        <headline>Edit User Custom Data Mapping</headline>
      </b-col>
      <b-col class="mt-2">
        <b-row>
          <b-col cols="5">
            <b-button download="mappring.json" :href="downloadMappingValue">
              Export Mapping
            </b-button>
          </b-col>
          <b-col cols="7">
            <b-form-file
              ref="file-input"
              class="custom-file-input"
              id="import-mapping"
              @change="loadMappingValue($event)"
              title="Import mapping from JSON file"
            />
            <label class="custom-file-label" for="import-mapping"
              >Import file</label
            >
          </b-col>
        </b-row>
      </b-col>
    </b-row>
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

::v-deep .customMappingDropdown {
  background-color: $light-grey-color;
  border: none;
}

::v-deep .show .customMappingDropdown i {
  transform: rotate(90deg);
}
</style>

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
    ...mapGetters('kuzzle', ['wrapper']),
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
    },
    downloadMappingValue() {
      const blob = new Blob([JSON.stringify(this.mappingValue)], {
        type: 'application/json'
      })
      return window.URL.createObjectURL(blob)
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
