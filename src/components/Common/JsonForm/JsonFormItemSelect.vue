<template>
  <div class="row input-field">
    <label :class="{'active': value}">{{name}}</label>
    <m-select :value="value" @input="update" :options="options">
      <option v-for="option in options" :key="option.id" :value="option.id">{{option.name}}</option>
    </m-select>
  </div>
</template>

<script>
  import MSelect from '../../Common/MSelect'

  const NULL_ID = '_NULL_'

  export default {
    name: 'JsonFormItemSelect',
    props: {
      content: Object,
      name: String,
      type: String,
      step: Number,
      parent: String,
      schema: Object
    },
    components: {
      MSelect
    },
    data () {
      return {
        value: NULL_ID
      }
    },
    computed: {
      options () {
        let options = this.schema.values || []
        return [{id: NULL_ID, name: null}]
          .concat(options.map(option => {
            return {
              id: option,
              name: option
            }
          }))
      }
    },
    methods: {
      update (value) {
        let _value = value === NULL_ID ? null : value
        this.$emit('update-value', {name: this.name, value: _value})
      },
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
