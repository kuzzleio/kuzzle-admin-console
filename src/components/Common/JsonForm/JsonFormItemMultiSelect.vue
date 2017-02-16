<template>
  <div class="row input-field">
    <p>{{name}}</p>
    <multiselect
      :options="options"
      :placeholder="name + ' values'"
      :value="valueAsArray"
      @input="updateValue"
      :multiple="true">
    </multiselect>
  </div>
</template>

<script>
  import Multiselect from 'vue-multiselect'

  export default {
    name: 'JsonFormItemMultiSelect',
    props: {
      content: Object,
      name: String,
      type: String,
      step: Number,
      parent: String,
      schema: Object
    },
    data () {
      return {
        value: null
      }
    },
    components: {
      Multiselect
    },
    computed: {
      options () {
        return this.schema.values || []
      },
      valueAsArray () {
        if (this.value && !Array.isArray(this.value)) {
          return [this.value]
        }

        return this.value
      }
    },
    methods: {
      initValue () {
        if (!Object.keys(this.content).length) {
          return
        }

        if (this.parent) {
          if (this.content[this.parent] && this.content[this.parent][this.name]) {
            this.value = this.content[this.parent][this.name]
          }
        } else {
          this.value = this.content[this.name]
        }
      },
      updateValue (newValue) {
        this.value = newValue
        this.$emit('update-value', {name: this.name, value: this.value})
      }
    },
    mounted () {
      this.initValue()
    },
    watch: {
      content: 'initValue'
    }
  }
</script>
