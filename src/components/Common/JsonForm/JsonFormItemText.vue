<template>
  <div class="row input-field">
    <input :id="fullName" type="text" :value="content" v-model="value" @focus="display = true" @blur="hideAttribute"/>
    <label :for="fullName" :class="{'active': value}">{{name}}</label>
  </div>
</template>

<script>
//  import {SET_PARTIAL_TO_DOCUMENT} from '../../../vuex/modules/data/mutation-types'

  export default {
    name: 'JsonFormItemText',
    props: {
      content: String,
      name: String,
      type: String,
      fullName: String
    },
    data () {
      return {
        value: '',
        display: false
      }
    },
//    watch: {
//      value (v) {
//        this.$store.commit(SET_PARTIAL_TO_DOCUMENT, {path: this.fullName, value: v})
//      },
//      content (v) {
//        this.value = v
//      }
//    },
    mounted () {
      this.value = this.content
    },
    methods: {
      hideAttribute () {
        setTimeout(() => {
          this.display = false
        }, 100)
      },
      transformToArray () {
        let splittedPath = this.fullName.split('.')
        splittedPath.pop()
        let value = [null]

        if (this.value) {
          value = [this.value, null]
        }
        this.$emit('document-create::change-type-attribute', splittedPath.join('.'), this.name, 'array', value)
      }
    }
  }
</script>
