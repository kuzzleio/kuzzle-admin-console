<template>
  <div class="row input-field">
    <input class="filled-in" :id="name" type="checkbox" v-model="value" :value="content" :checked="value" />
    <label :for="name">{{name}}</label>
  </div>
</template>

<script>
  import {setPartial} from '../../../vuex/modules/data/actions'

  export default{
    name: 'JsonFormItemCheckbox',
    props: {
      content: Boolean,
      name: String,
      type: String,
      fullName: String
    },
    data () {
      return {
        value: false
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
