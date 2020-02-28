<template>
  <div class="DocumentCreateOrUpdate">
    <b-card>
      <!-- Json view -->
      <b-row>
        <b-col lg="7" md="12">
          <b-form-group
            label="Document ID"
            label-cols="3"
            :description="
              !id ? 'Leave blank to let Kuzzle auto-generate the ID' : ''
            "
          >
            <b-input :disabled="!!id" v-model="idValue"></b-input>
          </b-form-group>
          <json-editor
            id="document"
            ref="jsoneditor"
            class="document-json"
            :content="document"
            :height="500"
          />
        </b-col>

        <!-- Mapping -->
        <b-col lg="5" md="12">
          <h3>Mapping</h3>

          <pre
            v-json-formatter="{
              content: mapping,
              open: true
            }"
            class="DocumentCreateOrUpdate-mapping"
          />
        </b-col>
      </b-row>

      <template v-slot:footer>
        <div class="text-right">
          <b-button @click="$emit('cancel')">Cancel</b-button>
          <b-button v-if="!id" variant="primary" class="ml-2" @click="submit">
            <i class="fa fa-plus-circle left" />
            Create
          </b-button>
          <b-button
            v-if="!!id"
            variant="primary"
            class="ml-2"
            data-cy="DocumentUpdate-btn"
            :disabled="submitting"
            @click="submit"
          >
            <i class="fa fa-pencil-alt left" />
            Update
          </b-button>
          <b-button
            v-if="!!id"
            variant="warning"
            class="ml-2"
            data-cy="DocumentReplace-btn"
            :disabled="submitting"
            @click="submit(true)"
          >
            <i class="fa fa-fire-alt left" />
            Replace
          </b-button>
        </div>
      </template>
    </b-card>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss">
.DocumentCreateOrUpdate {
  &-mapping {
    height: 500px;
    margin: 0;
    overflow-y: auto;
  }
}
</style>

<script>
import JsonEditor from '../../../Common/JsonEditor'
import Focus from '../../../../directives/focus.directive'
import title from '../../../../directives/title.directive'
import JsonFormatter from '../../../../directives/json-formatter.directive'

export default {
  name: 'DocumentCreateOrUpdate',
  components: {
    JsonEditor
  },
  directives: {
    Focus,
    title,
    JsonFormatter
  },
  props: {
    index: String,
    collection: String,
    id: String,
    document: { type: Object, default: () => ({}) },
    mapping: Object
  },
  data() {
    return {
      idValue: null,
      submitting: false
    }
  },
  computed: {},
  watch: {
    id: {
      immediate: true,
      handler(val) {
        this.idValue = val
      }
    }
  },
  methods: {
    submit(replace = false) {
      if (this.submitting) {
        return
      }

      if (this.$refs.jsoneditor.isValid()) {
        this.submitting = true
        const json = this.$refs.jsoneditor.getJson()
        this.$emit('submit', { ...json }, this.idValue, replace)
        this.submitting = false
      } else {
        this.$bvToast.toast(
          'The JSON specification of the document contains errors',
          {
            title: 'You cannot proceed',
            variant: 'info',
            toaster: 'b-toaster-bottom-right',
            appendToast: true
          }
        )
      }
    }
  }
}
</script>
