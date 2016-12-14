<template>
  <div class="row input-field">
    <fieldset>
      {{name}}

      <json-form-item-array-input
        :value-items="valueItems"
        :name="name"
        :full-name="fullName"
        :type="itemType">
      </json-form-item-array-input>
    </fieldset>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  .array-value {
    position: relative;
  }
</style>

<script>
  import { setPartial } from '../../../../vuex/modules/data/actions'
  import JsonFormItemArrayInput from './JsonFormItemArrayInput'
  import Vue from 'vue'

  export default {
    name: 'JsonFormItemArray',
    props: {
      name: String,
      content: Array,
      fullName: String
    },
    components: {
      JsonFormItemArrayInput
    },
    vuex: {
      actions: {
        setPartial
      }
    },
    data () {
      return {
        valueItems: [],
        partial: {},
        displayItems: []
      }
    },
    computed: {
      itemType () {
        if (this.content && this.content.length) {
          switch (typeof this.content[0]) {
            case 'number':
              return 'number'
            default:
              return 'text'
          }
        } else {
          this.content.push('')
        }

        return 'text'
      }
    },
    watch: {
      valueItems (v) {
        this.setPartial(this.fullName, [...v])
      },
      content () {
        this.valueItems = [...this.content]
      }
    },
    mounted () {
      this.valueItems = [...this.content]
    },
    events: {
      'json-form-item-array::remove-element' (index) {
        this.valueItems.splice(index, 1)
      },
      'json-form-item-array::add-element' () {
        Vue.set(this.valueItems, this.valueItems.length, null)
      }
    }
  }
</script>
