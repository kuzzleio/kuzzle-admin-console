<template>
  <div class="row input-field">
    <label :class="{'active': value}">{{ name }}</label>
    <m-select
      :value="castedValue"
      :options="options"
      @input="update"
    >
      <option
        v-for="option in options"
        :key="option.id"
        :value="option.id"
      >
        {{ option.name }}
      </option>
    </m-select>
  </div>
</template>

<script>
import MSelect from '../../Common/MSelect'
import { castByElementId } from '../../../services/collectionHelper'

const NULL_ID = '_NULL_'

export default {
  name: 'JsonFormItemSelect',
  components: {
    MSelect
  },
  props: {
    content: Object,
    name: String,
    type: String,
    step: Number,
    parent: String,
    schema: Object
  },
  data() {
    return {
      value: NULL_ID
    }
  },
  computed: {
    options() {
      let options = this.schema.values || []
      return [{ id: NULL_ID, name: null }].concat(
        options.map(option => {
          return {
            id: option,
            name: option
          }
        })
      )
    },
    castedValue() {
      return String(this.value)
    }
  },
  watch: {
    content: 'initValue'
  },
  mounted() {
    this.initValue()
  },
  methods: {
    update(value) {
      let _value = value === NULL_ID ? null : value

      if (_value !== NULL_ID) {
        _value = castByElementId(this.schema.id, _value)
      }

      this.$emit('update-value', { name: this.name, value: _value })
    },
    initValue() {
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
  }
}
</script>
