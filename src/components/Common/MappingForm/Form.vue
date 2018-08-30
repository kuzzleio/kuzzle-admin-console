<template>
  <div class="wrapper collection-form">

    <div class="row">
      <input type="checkbox" class="filled-in" id="allowForm" @change="changeAllowForm" :checked="allowFormProp"/>
      <label for="allowForm" class="allow-form">Associate mapping to form.</label>
    </div>

    <form-line
      v-for="(type, attributeName, index) in flattenMapping"
      :key="index"
      v-if="allowForm"
      :name="attributeName"
      :type="type"
      :index="index"
      :choose-values="flattenSchemaWithType[attributeName].chooseValues"
      :values="flattenSchemaWithType[attributeName].values"
      :value="flattenSchemaWithType[attributeName]"
      @input="changeSchema">
    </form-line>

    <div class="row">
      <div class="divider"></div>
    </div>

    <!-- Actions -->
    <div class="row">
      <div class="col s12">
        <a tabindex="6" class="btn-flat waves-effect" @click.prevent="cancel">Cancel</a>
        <button type="submit" class="btn primary waves-effect waves-light" @click.prevent="submit">
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import FormLine from './FormLine'
import {
  flattenObjectMapping,
  getDefaultSchemaForType,
  flattenObjectSchema,
  formatSchema
} from '../../../services/collectionHelper'

export default {
  name: 'SchemaForm',
  props: {
    mapping: Object,
    currentStep: {
      type: Number,
      required: true
    }
  },
  components: {
    FormLine
  },
  data() {
    return {
      schema: {},
      allowForm: true
    }
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
    currentStep(value) {
      this.$emit('change-step', this.gatherData)
    }
  },
  mounted() {
    this.schema = this.flattenSchemaWithType
  }
}
</script>
