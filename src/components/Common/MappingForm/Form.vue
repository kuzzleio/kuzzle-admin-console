<template>
  <div class="wrapper collection-form">
    <div class="row">
      <label>
        <input
          id="allowForm"
          type="checkbox"
          class="filled-in"
          :checked="allowFormProp"
          @change="changeAllowForm"
        />
        <span class="allow-form">Associate mapping to form.</span>
      </label>
    </div>

    <div v-if="allowForm">
      <form-line
        v-for="(type, attributeName, index) in flattenMapping"
        :key="index"
        :name="attributeName"
        :type="type"
        :index="index"
        :choose-values="flattenSchemaWithType[attributeName].chooseValues"
        :values="flattenSchemaWithType[attributeName].values"
        :value="flattenSchemaWithType[attributeName]"
        @input="changeSchema"
      />
    </div>

    <div class="row">
      <div class="divider" />
    </div>

    <!-- Actions -->
    <div class="row">
      <div class="col s12">
        <a tabindex="6" class="btn-flat waves-effect" @click.prevent="cancel"
          >Cancel</a
        >
        <button
          type="submit"
          class="btn primary waves-effect waves-light"
          @click.prevent="submit"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  flattenObjectMapping,
  getDefaultSchemaForType,
  flattenObjectSchema,
  formatSchema
} from '@/services/collectionHelper'
import FormLine from './FormLine.vue'

export default {
  name: 'SchemaForm',
  components: {
    FormLine
  },
  props: {
    mapping: Object,
    currentStep: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      schema: {},
      allowForm: true
    }
  },
  computed: {
    flattenMapping() {
      return flattenObjectMapping(this.mapping)
    },
    flattenSchema() {
      return flattenObjectSchema(this.schema)
    },
    flattenSchemaWithType() {
      let schema = {}

      Object.keys(this.flattenMapping).forEach(attribute => {
        if (this.flattenSchema && this.flattenSchema[attribute]) {
          schema[attribute] = { ...this.flattenSchema[attribute] }
        } else {
          schema[attribute] = {
            ...getDefaultSchemaForType(this.flattenMapping[attribute])
          }
        }
      })

      return schema
    },
    gatherData() {
      return {
        schema: this.schema,
        allowForm: this.allowForm
      }
    }
  },
  watch: {
    currentStep() {
      this.$emit('change-step', this.gatherData)
    }
  },
  mounted() {
    this.schema = this.flattenSchemaWithType
  },
  methods: {
    next() {
      this.$emit('next', this.gatherData)
    },
    cancel() {
      this.$emit('cancel')
    },
    changeAllowForm(e) {
      this.allowForm = e.target.checked
    },
    changeSchema(event) {
      this.schema = formatSchema({
        ...this.schema,
        [event.name]: event.element
      })
    }
  }
}
</script>
