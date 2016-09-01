<template>
  <div class="row input-field">
    <input :id="name" type="number" v-model="value" :value="content" step="0.1" />
    <label :for="name" :class="{'active': value}">{{name}}</label>
  </div>
</template>

<script>
  import {setPartial} from '../../../vuex/modules/data/actions'

  export default{
    name: 'JsonFormItemNumber',
    props: {
      content: Number,
      name: String,
      fullName: String
    },
    data () {
      return {
        value: null
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
