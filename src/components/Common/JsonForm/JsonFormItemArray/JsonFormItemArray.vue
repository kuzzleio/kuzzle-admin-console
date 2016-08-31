<template>
  <div>
    <fieldset>
      {{name}}

      <component
        :is="componentItem"
        :value-items="valueItems"
        :name="name"
      ></component>
    </fieldset>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss">
  .array-value {
    position: relative;
  }
</style>

<script>
  import { setPartial } from '../../../../vuex/modules/data/actions'
  import JsonFormItemArrayString from './JsonFormItemArrayString'
  import JsonFormItemArrayNumber from './JsonFormItemArrayNumber'

  export default {
    name: 'JsonFormItemArray',
    props: {
      name: String,
      content: Array,
      fullName: String
    },
    components: {
      JsonFormItemArrayString,
      JsonFormItemArrayNumber
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
      componentItem () {
        if (this.content.length) {
          switch (typeof this.content[0]) {
            case 'number':
              return 'JsonFormItemArrayNumber'
            default:
              return 'JsonFormItemArrayString'
          }
        }

        return 'JsonFormItemArray'
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
    ready () {
      this.valueItems = [...this.content]
    },
    methods: {
      setValue (e, index) {
        this.valueItems.$set(index, e.target.value)
      }
    },
    events: {
      'json-form-item-array::remove-element' (index) {
        this.valueItems.splice(index, 1)
      },
      'json-form-item-array::add-element' () {
        this.valueItems.$set(this.valueItems.length, null)
      }
    }
  }
</script>
