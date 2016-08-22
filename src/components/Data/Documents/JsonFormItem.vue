<template>
  <div class="row input-field">
    <input :id="name" :type="type" name="collection" v-model="value" @input="updatePartial" step="0.1"/>
    <label :for="name">{{name}}</label>
  </div>
</template>

<script>
  import {setPartial} from '../../../vuex/modules/data/actions'

  export default {
    name: 'JsonFormItem',
    props: {
      name: String,
      content: Object,
      fullName: String,
      defaultValue: String
    },
    ready () {
      if (this.content.val) {
        this.value = this.content.val
        this.updatePartial()
      }
      this.getType()
    },
    data () {
      return {
        value: '',
        partial: {},
        type: 'text'
      }
    },
    methods: {
      updatePartial () {
        this.setPartial(this.fullName, this.value)
      },
      getType () {
        switch (this.content.type) {
          case 'boolean':
            this.type = 'checkbox'
            break
          case 'integer':
          case 'long':
          case 'short':
          case 'byte':
          case 'double':
          case 'float':
            this.type = 'number'
            break
          default:
            this.type = 'text'
            break
        }
      }
    },
    vuex: {
      actions: {
        setPartial
      }
    }
  }
</script>
