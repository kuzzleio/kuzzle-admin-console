<template>
  <input :id="name" type="text" name="collection" v-model="value" @input="updatePartial" />
  <label :for="name">{{name}}</label>
</template>

<script>
  import {setPartial} from '../../../vuex/modules/data/actions'

  export default {
    name: 'JsonFormItem',
    props: {
      name: String,
      content: Object,
      fullName: String
    },
    data () {
      return {
        value: '',
        partial: {}
      }
    },
    methods: {
      updatePartial () {
        this.setPartial(this.fullName, this.value)
      }
    },
    vuex: {
      actions: {
        setPartial
      }
    }
  }
</script>
