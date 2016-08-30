<template>
  <div class="row input-field">
    <input class="filled-in" :id="name" type="checkbox" v-model="value"/>
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
      },
      content (content) {
        console.log('ici', content)
        this.value = content
      }
    },
    vuex: {
      actions: {
        setPartial
      }
    }
  }
</script>
