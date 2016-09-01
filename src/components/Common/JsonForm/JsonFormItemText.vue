<template>
  <div class="row input-field">
    <input :id="name" type="text" v-model="value" :value="content" />
    <label :for="name" :class="{'active': value}">{{name}}</label>
  </div>
</template>

<script>
  import {setPartial} from '../../../vuex/modules/data/actions'

  export default {
    name: 'JsonFormItemText',
    props: {
      content: String,
      name: String,
      fullName: String
    },
    data () {
      return {
        value: ''
      }
    },
    watch: {
      value (v) {
        this.setPartial(this.fullName, v)
      }
    },
    vuex: {
      actions: {
        setPartial
      }
    }
  }
</script>
