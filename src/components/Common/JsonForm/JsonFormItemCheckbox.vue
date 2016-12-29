<template>
  <div class="row input-field">
    <input class="filled-in" :id="fullName" type="checkbox" v-model="value" :value="content" :checked="value" />
    <label :for="fullName">{{name}}</label>
  </div>
</template>

<script>
  import {SET_PARTIAL} from '../../../vuex/modules/data/mutation-types'

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
        this.$store.commit(SET_PARTIAL, {path: this.fullName, value: v})
      },
      content (v) {
        this.value = v
      }
    }
  }
</script>
