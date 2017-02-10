<template>
  <div class="row input-field">
    <input class="filled-in" :id="fullName" type="checkbox" v-model="value" :value="content" :checked="value" />
    <label :for="fullName">{{name}}</label>
  </div>
</template>

<script>
  import {SET_PARTIAL_TO_DOCUMENT} from '../../../vuex/modules/data/mutation-types'

  export default{
    name: 'JsonFormItemCheckbox',
    props: {
      content: {type: Boolean, default: false},
      name: String,
      type: String,
      fullName: String
    },
    data () {
      return {
        value: false
      }
    },
    mounted () {
      if (!this.content) {
        this.$store.commit(SET_PARTIAL_TO_DOCUMENT, {path: this.fullName, value: false})
      } else {
        this.value = this.content
      }
    },
    watch: {
      value (v) {
        this.$store.commit(SET_PARTIAL_TO_DOCUMENT, {path: this.fullName, value: v})
      },
      content (v) {
        this.value = v
      }
    }
  }
</script>
